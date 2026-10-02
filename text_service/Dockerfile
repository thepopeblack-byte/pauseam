FROM python:3.11-slim@sha256:9f6ef439f51f4b36dc5c6bb265c2d3dd810bde94c5bbec77ae86b6650c488cf9
WORKDIR /app
COPY text_service/requirements.txt .
ARG TORCH_INDEX_URL=https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir torch==2.6.0 --index-url "$TORCH_INDEX_URL" && pip install --no-cache-dir -r requirements.txt && useradd --uid 10001 --create-home app
COPY text_service/app.py text_service/start.py text_service/selection.py text_service/model-manifest.json ./
COPY model_service/http_safety.py ./
COPY model_service/verified_weights.py model_service/license_quota.py ./
RUN mkdir -p /home/app/models /home/app/license && chown -R app:app /home/app
USER 10001
ENV HF_HOME=/tmp/huggingface PORT=8000 PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 HF_HUB_DISABLE_TELEMETRY=1 DO_NOT_TRACK=1
CMD ["python", "start.py"]
