"""Protected real-model proxy. No output generation, audio storage or substitution."""
import asyncio
import hmac
import json
import os
import urllib.error
import urllib.parse
import urllib.request
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, Response
from starlette.concurrency import run_in_threadpool

app=FastAPI(docs_url=None,redoc_url=None,openapi_url=None)
slots=asyncio.Semaphore(1)  # One inference across all models on the CPU pilot.
processes={}
TARGETS={'text':8100,'en':8101,'yo':8102,'ha':8103,'ig':8104}

def route_target(path,method):
    parts=path.split('/')
    if len(parts)==2 and parts[0]=='text' and parts[1] in ('ready','health','guide'):
        target,operation='text',parts[1]
    elif len(parts)==3 and parts[0]=='asr' and parts[1] in ('en','yo','ha','ig') and parts[2] in ('ready','health','transcribe'):
        target,operation=parts[1],parts[2]
    else: raise HTTPException(404,'Unknown route')
    if method!=('POST' if operation in ('guide','transcribe') else 'GET'): raise HTTPException(405,'Method not allowed')
    return target,operation

def service_token(target):
    token=os.environ.get('TEXT_SERVICE_TOKEN' if target=='text' else 'ASR_SERVICE_TOKEN','')
    if len(token)<32: raise HTTPException(503,'Service credential unavailable')
    return token

def http_call(url,data=None,headers=None,timeout=55):
    request=urllib.request.Request(url,data=data,headers=headers or {})
    # Never follow upstream redirects with a service credential.
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self,*args,**kwargs): return None
    try:
        response=urllib.request.build_opener(NoRedirect).open(request,timeout=timeout)
    except urllib.error.HTTPError as error:
        response=error
    with response:
        raw=response.read(8193)
        if len(raw)>8192: raise HTTPException(503,'Upstream contract unavailable')
        return response.status,raw

def reserve_quota():
    endpoint=os.environ.get('QUOTA_ENDPOINT','')
    token=os.environ.get('QUOTA_SERVICE_TOKEN','')
    url=urllib.parse.urlsplit(endpoint)
    if url.scheme!='https' or not url.netloc or url.username or url.password or url.query or url.fragment or url.path!='/api/model-quota' or len(token)<32:
        raise HTTPException(503,'Persistent licence service unavailable')
    try:
        status,raw=http_call(endpoint,b'',{'Authorization':'Bearer '+token},10)
        data=json.loads(raw)
        if status==429 and data.get('reserved') is False: raise HTTPException(429,'Pilot licence quota reached')
        if status!=200 or data.get('reserved') is not True or data.get('limit')!=950: raise HTTPException(503,'Persistent licence reservation failed')
    except HTTPException: raise
    except Exception: raise HTTPException(503,'Persistent licence service unavailable') from None

async def bounded_audio_or_json(request,maximum):
    raw=bytearray()
    try:
        async with asyncio.timeout(10):
            async for chunk in request.stream():
                if len(raw)+len(chunk)>maximum: raise HTTPException(413,'Request too large')
                raw.extend(chunk)
        return raw
    except BaseException:
        raw[:]=b'\0'*len(raw)
        raise

@app.get('/')
async def index():
    return JSONResponse({'service':'PauseAm model gateway','product':'https://pauseam.theblockcapitol.com','note':'Model readiness is separate from this gateway.'},headers={'Cache-Control':'no-store'})

@app.api_route('/{path:path}',methods=['GET','POST','PUT','DELETE','PATCH'])
async def proxy(path:str,request:Request):
    target,operation=route_target(path,request.method)
    token=service_token(target)
    if operation!='ready' and not hmac.compare_digest(request.headers.get('authorization',''),'Bearer '+token):
        raise HTTPException(401,'Unauthorized')
    if request.url.query: raise HTTPException(400,'Query parameters are unsupported')
    content_type='application/json' if target=='text' else 'audio/wav'
    inference=operation in ('guide','transcribe')
    if inference and request.headers.get('content-type')!=content_type: raise HTTPException(415,'Unsupported content type')
    if inference and slots.locked(): raise HTTPException(429,'CPU pilot busy; retry deliberately')
    raw=None
    try:
        if inference:
            async with slots:
                raw=await bounded_audio_or_json(request,20000 if target=='text' else 960044)
                # Reserve durably before every inference, including failed calls.
                await run_in_threadpool(reserve_quota)
                status,data=await run_in_threadpool(http_call,f'http://127.0.0.1:{TARGETS[target]}/{operation}',bytes(raw),{'Authorization':'Bearer '+token,'Content-Type':content_type})
        else:
            status,data=await run_in_threadpool(http_call,f'http://127.0.0.1:{TARGETS[target]}/{operation}',None,{'Authorization':'Bearer '+token},5)
        return Response(data,status_code=status,media_type='application/json',headers={'Cache-Control':'no-store'})
    except HTTPException: raise
    except Exception: raise HTTPException(503,'Model unavailable; no substitute output created') from None
    finally:
        if raw is not None: raw[:]=b'\0'*len(raw)
