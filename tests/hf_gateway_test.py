"""Transport fixtures only: no weights, speech, model output or user validation."""
import importlib.util
import json
import os
import sys
from pathlib import Path
import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient

path=Path(__file__).resolve().parents[1]/'deployment/huggingface-space/gateway.py'
sys.path.insert(0,str(path.parents[2]/'model_service'))
spec=importlib.util.spec_from_file_location('hf_gateway',path)
gateway=importlib.util.module_from_spec(spec)
spec.loader.exec_module(gateway)
TOKEN='unit-test-private-token-only-123456789'

class GatewayBoundaries(unittest.TestCase):
    def setUp(self):
        self.env=patch.dict(os.environ,{'ASR_SERVICE_TOKEN':TOKEN,'TEXT_SERVICE_TOKEN':TOKEN,
             'QUOTA_SERVICE_TOKEN':TOKEN,'QUOTA_ENDPOINT':'https://example.test/api/model-quota'})
        self.env.start()
        self.client=TestClient(gateway.app)
        self.headers={'Authorization':'Bearer '+TOKEN,'Content-Type':'audio/wav'}
    def tearDown(self):
        self.client.close()
        self.env.stop()
    def test_unapproved_routes_and_wrong_method_cannot_reach_proxy(self):
        with patch.object(gateway,'http_call') as call:
            for path in ('/asr/fr/transcribe','/asr/en/guide','/text/transcribe','/admin','/asr/en/transcribe/extra'):
                self.assertEqual(self.client.post(path,headers=self.headers).status_code,404)
            self.assertEqual(self.client.get('/asr/en/transcribe').status_code,405)
            call.assert_not_called()
    def test_authentication_and_content_type_gate(self):
        with patch.object(gateway,'http_call') as call:
            self.assertEqual(self.client.post('/asr/en/transcribe',content=b'test').status_code,401)
            self.assertEqual(self.client.post('/asr/en/transcribe',headers={'Authorization':'Bearer '+TOKEN},content=b'test').status_code,415)
            self.assertEqual(self.client.post('/asr/en/transcribe?token=x',headers=self.headers).status_code,400)
            call.assert_not_called()
    def test_oversized_body_never_reserves_or_calls_model(self):
        with patch.object(gateway,'http_call') as call,patch.object(gateway,'reserve_quota') as quota:
            self.assertEqual(self.client.post('/asr/en/transcribe',headers=self.headers,content=b'x'*960045).status_code,413)
            call.assert_not_called();quota.assert_not_called()
    def test_unavailable_quota_withholds_all_inference(self):
        with patch.object(gateway,'http_call',side_effect=OSError('fixture offline')) as call:
            self.assertEqual(self.client.post('/asr/en/transcribe',headers=self.headers,content=b'fixture-not-audio').status_code,503)
            self.assertEqual(call.call_count,1)
            self.assertEqual(call.call_args.args[0],'https://example.test/api/model-quota')
    def test_quota_exhaustion_returns_429_without_model(self):
        with patch.object(gateway,'http_call',return_value=(429,b'{"reserved":false}')) as call:
            self.assertEqual(self.client.post('/asr/en/transcribe',headers=self.headers,content=b'fixture-not-audio').status_code,429)
            self.assertEqual(call.call_count,1)
    def test_transport_error_never_creates_transcript(self):
        with patch.object(gateway,'reserve_quota'),patch.object(gateway,'http_call',side_effect=OSError('fixture offline')):
            response=self.client.post('/asr/en/transcribe',headers=self.headers,content=b'fixture-not-audio')
            self.assertEqual(response.status_code,503)
            self.assertNotIn('text',response.json())
    def test_success_is_only_forwarded_after_durable_reservation(self):
        events=[]
        def reserve(): events.append('reserved')
        def upstream(*args):
            events.append('upstream');self.assertEqual(args[0],'http://127.0.0.1:8102/transcribe')
            return 422,b'{"detail":"fixture validation rejection"}'
        with patch.object(gateway,'reserve_quota',side_effect=reserve),patch.object(gateway,'http_call',side_effect=upstream):
            response=self.client.post('/asr/yo/transcribe',headers=self.headers,content=b'fixture-not-audio')
            self.assertEqual(response.status_code,422);self.assertEqual(events,['reserved','upstream'])
            self.assertEqual(response.headers['cache-control'],'no-store')
    def test_invalid_quota_url_is_rejected_before_network(self):
        for url in ('http://example.test/api/model-quota','https://example.test/api/model-quota?key=x','https://user:pass@example.test/api/model-quota'):
            with patch.dict(os.environ,{'QUOTA_ENDPOINT':url}),patch.object(gateway,'http_call') as call:
                with self.assertRaises(gateway.HTTPException): gateway.reserve_quota()
                call.assert_not_called()

if __name__=='__main__': unittest.main()
