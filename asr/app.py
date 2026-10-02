"""Real NCAIR inference service. No synthetic responses or audio persistence."""
import asyncio
import hmac
import io
import os
import re
import time
import wave
try:
    from .audio_validation import validate_pcm
except ImportError:
    from audio_validation import validate_pcm
from collections import deque
from contextlib import asynccontextmanager

import numpy as np
import torch
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool
from transformers import pipeline

MODELS = {
    "en": ("NCAIR1/NigerianAccentedEnglish", "3c52c6e6c9ec508014a7b9db6a42b503b8930dff"),
    "yo": ("NCAIR1/Yoruba-ASR", "d1ae7b8b79c2ccd547d8761effe5057433f3fc7f"),
    "ha": ("NCAIR1/Hausa-ASR", "e635b9eda29060c6114c8f4d8b2d903f5c83a44a"),
    "ig": ("NCAIR1/Igbo-ASR", "180732299d5cba3dc8b289260ac84b7838bb3954"),
}
LANGUAGE = os.environ.get("MODEL_LANGUAGE", "en")
MODEL, REVISION = MODELS[LANGUAGE]
MAX_BYTES = 960044
asr = None
slots = asyncio.Semaphore(1)
attempts = deque()
TOKEN = os.environ.get("ASR_SERVICE_TOKEN", "")


@asynccontextmanager
async def lifespan(app):
    global asr
    if len(TOKEN) < 32:
        raise RuntimeError("Set a random ASR_SERVICE_TOKEN of at least 32 characters.")
    if not os.environ.get("HF_TOKEN"):
        raise RuntimeError("Set HF_TOKEN after approval for the gated NCAIR model.")
    if os.environ.get("MODEL_REVISION") != REVISION:
        raise RuntimeError("MODEL_REVISION must match the pinned revision.")
    threads = int(os.environ.get("MODEL_THREADS", "1"))
    if not 1 <= threads <= 8:
        raise RuntimeError("MODEL_THREADS must be between one and eight")
    torch.set_num_threads(threads)
    # Failure to load is fatal: never fall back to Whisper base or another model.
    asr = pipeline(
        "automatic-speech-recognition", model=MODEL, revision=REVISION,
        token=os.environ["HF_TOKEN"], trust_remote_code=False,
        model_kwargs={"use_safetensors": False, "weights_only": True},
        device=0 if torch.cuda.is_available() else -1,
    )
    if getattr(asr.model.config, "_commit_hash", None) != REVISION:
        raise RuntimeError("Loaded model revision could not be verified.")
    yield
    asr = None


app = FastAPI(lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)


def authenticate(request):
    supplied = request.headers.get("authorization", "")
    if not TOKEN or not hmac.compare_digest(supplied, "Bearer " + TOKEN):
        raise HTTPException(401, "Unauthorized")


@app.get("/ready")
async def ready():
    return JSONResponse({"ready": asr is not None}, status_code=200 if asr is not None else 503,
                        headers={"Cache-Control": "no-store"})

@app.get("/health")
async def health(request: Request):
    authenticate(request)
    return JSONResponse({"ready": asr is not None, "model": MODEL, "revision": REVISION, "language": LANGUAGE},
                        headers={"Cache-Control": "no-store"})


def infer(raw):
    try:
        samples = np.frombuffer(validate_pcm(raw), dtype="<i2").astype(np.float32) / 32768
        if np.sqrt(np.mean(samples ** 2)) < .004:
            raise ValueError()
    except Exception:
        raise HTTPException(422, "Invalid, silent or unsupported audio")
    try:
        with torch.inference_mode():
            result = asr({"raw": samples, "sampling_rate": 16000},
                         generate_kwargs={"task": "transcribe", "max_new_tokens": 128})
        text = result.get("text", "").strip()
        if not text or len(text) > 1000:
            raise HTTPException(422, "No usable transcript")
        if re.search(r"\d|[\w.+-]+@[\w.-]+\.[a-z]{2,}", text, re.I) or re.search(
            r"\b(?:my|the)\s+(?:pin|otp|password|passcode|credential|account number)\s*(?:is|:|=)\s*\S+", text, re.I
        ) or re.search(r"\b(?:zero|one|two|three|four|five|six|seven|eight|nine)(?:[\s,-]+(?:zero|one|two|three|four|five|six|seven|eight|nine)){2,}\b", text, re.I):
            raise HTTPException(422, "Possible private details: transcript discarded")
        return {"text": text, "model": MODEL, "revision": REVISION, "language": LANGUAGE}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(503, "Inference unavailable")
    finally:
        samples.fill(0)


@app.post("/transcribe")
async def transcribe(request: Request):
    authenticate(request)
    if request.headers.get("content-type") != "audio/wav":
        raise HTTPException(415, "Use audio/wav")
    if asr is None:
        raise HTTPException(503, "Model not ready")
    now = time.monotonic()
    while attempts and now - attempts[0] > 60:
        attempts.popleft()
    if len(attempts) >= 30 or slots.locked():
        raise HTTPException(429, "Inference capacity reached; try later")
    attempts.append(now)
    async with slots:
        raw = bytearray()
        try:
            async with asyncio.timeout(10):
                async for chunk in request.stream():
                    raw.extend(chunk)
                    if len(raw) > MAX_BYTES:
                        raise HTTPException(413, "Audio too large")
            result = await run_in_threadpool(infer, raw)
            return JSONResponse(result, headers={"Cache-Control": "no-store", "X-Content-Type-Options": "nosniff"})
        except TimeoutError:
            raise HTTPException(408, "Upload timed out")
        finally:
            raw[:] = b"\x00" * len(raw)


