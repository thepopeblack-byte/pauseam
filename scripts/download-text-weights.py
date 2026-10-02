"""Private official-model download; no URLs, credentials or outputs are printed."""
import json
import logging
import os
from pathlib import Path
import shutil
import sys
from huggingface_hub import hf_hub_download
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'model_service'))
from verified_weights import file_matches
logging.disable(logging.CRITICAL)
os.environ['HF_HUB_DISABLE_PROGRESS_BARS']='1'
os.environ['HF_HUB_DISABLE_TELEMETRY']='1'
manifest=json.loads((ROOT/'text_service/model-manifest.json').read_text())
destination=ROOT/'private/quantization/source'
destination.mkdir(parents=True,exist_ok=True)
if not os.environ.get('HF_TOKEN'):raise SystemExit('Load approved HF_TOKEN privately.')
try:
    for entry in manifest['files']:
        final=destination/entry['path']
        if not file_matches(final,entry):
            source=Path(hf_hub_download(manifest['model'],entry['path'],revision=manifest['revision'],token=os.environ['HF_TOKEN'],cache_dir=str(ROOT/'private/quantization/hf-cache'))).resolve()
            if not file_matches(source,entry):raise ValueError('Checksum failed')
            temporary=final.with_suffix(final.suffix+'.verified')
            try:os.link(source,temporary)
            except OSError:shutil.copyfile(source,temporary)
            os.replace(temporary,final)
        print('Verified: '+entry['path'],flush=True)
    (ROOT/'private/quantization/source-verification.json').write_text(json.dumps({**manifest,'allBytesVerified':True,'inferencePerformed':False},indent=2))
except Exception as error:
    raise SystemExit('Approved official download incomplete: '+type(error).__name__) from None
