"""Authenticated CPU inference around the actual N-ATLaS model; no replacement."""
import asyncio
from contextlib import asynccontextmanager
import json
import os
from pathlib import Path
import subprocess
import urllib.error
import urllib.request
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool
from bootstrap import approved_source, prepare
from contract import MODEL,REVISION,LLAMA_COMMIT,QUANTIZATION,completion_payload,selection_result,validate_request
from http_safety import valid_bearer,append_bounded
from license_quota import reserve_model_use

TOKEN=os.environ.get('TEXT_SERVICE_TOKEN','')
slot=asyncio.Semaphore(1)
child=None
receipt=None

def internal(route,data=None):
    body=json.dumps(data,ensure_ascii=False).encode() if data is not None else None
    req=urllib.request.Request('http://127.0.0.1:8081'+route,data=body,headers={'Content-Type':'application/json'})
    # No redirects or credentials are involved: the engine is fixed to loopback.
    with urllib.request.urlopen(req,timeout=38) as response:
        raw=response.read(16385)
        if len(raw)>16384: raise ValueError('Oversized model response')
        return json.loads(raw)

@asynccontextmanager
async def lifespan(app):
    global child,receipt
    if len(TOKEN)<32 or not os.environ.get('LICENSE_DB') or os.environ.get('MODEL_REVISION')!=REVISION:
        raise RuntimeError('Explicit private credential, persistent ledger and pinned revision required')
    threads=int(os.environ.get('MODEL_THREADS','4'))
    if not 1<=threads<=8: raise RuntimeError('Invalid CPU thread setting')
    try:
        source=await run_in_threadpool(approved_source)
        model,receipt=await run_in_threadpool(prepare,source,Path(os.environ['QUANTIZED_MODEL_CACHE'])/REVISION,'/opt/llama-src/convert_hf_to_gguf.py','/opt/llama/bin/llama-quantize')
        child=subprocess.Popen(['/opt/llama/bin/llama-server','-m',str(model),'--host','127.0.0.1','--port','8081','--ctx-size','2048','--threads',str(threads),'--threads-batch',str(threads),'--parallel','1','--no-webui','--no-slots','--no-context-shift','--no-cache-prompt','--log-disable','--jinja'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        for attempt in range(120):
            if child.poll() is not None: raise RuntimeError('CPU engine stopped')
            try:
                await run_in_threadpool(internal,'/health')
                break
            except Exception:
                await asyncio.sleep(1)
        else: raise RuntimeError('CPU engine readiness timeout')
        yield
    except Exception:
        raise RuntimeError('CPU model startup failed; inspect approved access, memory, disk and pinned runtime privately') from None
    finally:
        if child and child.poll() is None:
            child.terminate()
            try: await run_in_threadpool(child.wait,10)
            except subprocess.TimeoutExpired: child.kill()
        child=None

app=FastAPI(lifespan=lifespan,docs_url=None,redoc_url=None,openapi_url=None)
def auth(request):
    if not valid_bearer(request.headers.get('authorization',''),TOKEN): raise HTTPException(401,'Unauthorized')
def running(): return child is not None and child.poll() is None

@app.get('/ready')
async def ready(): return JSONResponse({'ready':running()},status_code=200 if running() else 503,headers={'Cache-Control':'no-store'})
@app.get('/health')
async def health(request:Request):
    auth(request)
    return {'ready':running(),'model':MODEL,'revision':REVISION,'weightsProvenance':'official-bytes-verified-then-quantized',
        'runtime':'llama.cpp','runtimeRevision':LLAMA_COMMIT,'quantization':QUANTIZATION,
        'quantizedSha256':receipt['sha256'] if receipt else None,'contractVersion':'reviewed-card-relevance-v1','fineTuningPerformed':False}

@app.post('/guide')
async def guide(request:Request):
    auth(request)
    if request.headers.get('content-type')!='application/json': raise HTTPException(415,'Use application/json')
    if not running(): raise HTTPException(503,'Model unavailable')
    if slot.locked(): raise HTTPException(429,'Busy; retry later')
    raw=bytearray()
    async with slot:
        try:
            async with asyncio.timeout(10):
                async for chunk in request.stream():
                    if not append_bounded(raw,chunk,20000): raise HTTPException(413,'Too large')
            data=validate_request(json.loads(raw))
            payload=completion_payload(data)
            if not await run_in_threadpool(reserve_model_use,os.environ['LICENSE_DB']): raise HTTPException(429,'Pilot licence quota reached')
            # Keep the slot until the engine finishes even if the client leaves.
            # A timed-out internal request may still be computing; restart the
            # child to avoid admitting overlapping work or returning stale output.
            try:
                result=await run_in_threadpool(internal,'/v1/chat/completions',payload)
            except urllib.error.HTTPError as error:
                if error.code in (400,413,422):
                    raise HTTPException(422,'Model context or contract rejected') from None
                if child and child.poll() is None: child.terminate()
                asyncio.get_running_loop().call_later(0.5,os._exit,1)
                raise HTTPException(503,'Model unavailable') from None
            except Exception:
                if child and child.poll() is None: child.terminate()
                asyncio.get_running_loop().call_later(0.5,os._exit,1)
                raise HTTPException(503,'Model unavailable') from None
            response=selection_result(result,[c['id'] for c in data['cards']])
            return JSONResponse(response,headers={'Cache-Control':'no-store'})
        except HTTPException: raise
        except (ValueError,TypeError,KeyError): raise HTTPException(422,'Request or model contract rejected') from None
        except Exception: raise HTTPException(503,'Model unavailable') from None
        finally: raw[:]=b'\x00'*len(raw)
