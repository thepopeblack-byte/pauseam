"""Five real model processes, loopback-only; no shell or secret-bearing arguments."""
import json
import os
from pathlib import Path
import subprocess
import sys
import threading
import time
import uvicorn
import gateway

def configurations(source):
    result=[]
    for target,port in gateway.TARGETS.items():
        env=dict(os.environ)
        env.update({'MODEL_REVISION':source[target]['revision'],'MODEL_THREADS':'4' if target=='text' else '1',
                    'HF_HOME':f'/tmp/pauseam-models/{target}/hf','VERIFIED_MODEL_CACHE':f'/tmp/pauseam-models/{target}/verified',
                    'LICENSE_DB':'/tmp/pauseam-local-quota.sqlite'})
        if target=='text': env.update({'MODEL_BUCKET_ID':'','MODEL_BUCKET_PREFIX':'','TEXT_DTYPE':'bfloat16'})
        else: env.update({'MODEL_LANGUAGE':target,'MODEL_BUCKET_ID':source[target]['bucket'],'MODEL_BUCKET_PREFIX':source[target]['prefix']})
        result.append((target,port,env,'/app' if target=='text' else '/app/asr'))
    return result

def main():
    for key in ('TEXT_SERVICE_TOKEN','ASR_SERVICE_TOKEN','QUOTA_SERVICE_TOKEN'):
        if len(os.environ.get(key,''))<32: raise SystemExit('Required private service credential missing')
    if not os.environ.get('HF_TOKEN'): raise SystemExit('Approved official text-model access missing')
    # Central D1 reservations are authoritative; the ephemeral SQLite ledger is
    # an extra local limiter and cannot reset the durable total on restart.
    endpoint=os.environ.get('QUOTA_ENDPOINT','')
    if not endpoint.startswith('https://') or not endpoint.endswith('/api/model-quota'): raise SystemExit('Persistent licence endpoint missing')
    source=json.loads(Path('approved-sources.json').read_text())
    for target,port,env,cwd in configurations(source):
        gateway.processes[target]=subprocess.Popen([sys.executable,'-m','uvicorn','app:app','--host','127.0.0.1','--port',str(port),'--no-access-log','--log-level','warning'],cwd=cwd,env=env,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    def monitor():
        deadline=time.monotonic()+3600
        pending=set(gateway.TARGETS)
        while True:
            for target,process in gateway.processes.items():
                if process.poll() is not None:
                    # Record target/status only. Library error text can contain
                    # provider details; do not emit its headers, URLs or body.
                    print(json.dumps({'target':target,'event':'model_start_failed','exitCode':process.returncode}),flush=True)
                    os._exit(1)
                if target in pending:
                    try:
                        status,raw=gateway.http_call(f'http://127.0.0.1:{gateway.TARGETS[target]}/ready',timeout=2)
                        if status==200 and json.loads(raw).get('ready') is True:
                            pending.remove(target)
                            print(json.dumps({'target':target,'event':'model_ready'}),flush=True)
                    except Exception: pass
            if pending and time.monotonic()>deadline:
                print(json.dumps({'event':'startup_deadline_exceeded','targets':sorted(pending)}),flush=True)
                os._exit(1)
            time.sleep(5)
    threading.Thread(target=monitor,daemon=True).start()
    try: uvicorn.run(gateway.app,host='0.0.0.0',port=7860,access_log=False,log_level='warning')
    finally:
        for process in gateway.processes.values(): process.terminate()
        for process in gateway.processes.values():
            try: process.wait(timeout=10)
            except subprocess.TimeoutExpired: process.kill()

if __name__=='__main__': main()
