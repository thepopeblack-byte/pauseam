FROM python:3.11-slim@sha256:9f6ef439f51f4b36dc5c6bb265c2d3dd810bde94c5bbec77ae86b6650c488cf9
WORKDIR /service
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 HF_HUB_DISABLE_TELEMETRY=1 DO_NOT_TRACK=1 HF_HOME=/tmp/model-cache
COPY asr/requirements.txt .
ARG TORCH_INDEX_URL=https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir torch==2.6.0 --index-url "$TORCH_INDEX_URL" && pip install --no-cache-dir -r requirements.txt
COPY asr/app.py asr/audio_validation.py asr/start.py ./
COPY model_service/http_safety.py ./
COPY model_service/license_quota.py model_service/verified_weights.py ./
COPY asr/manifests ./manifests
RUN useradd --uid 10001 --create-home inference
RUN mkdir -p /home/inference/models /home/inference/license && chown -R inference:inference /home/inference
USER inference
EXPOSE 8000
CMD ["python", "start.py"]


