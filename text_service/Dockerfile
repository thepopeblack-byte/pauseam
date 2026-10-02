FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
ARG TORCH_INDEX_URL=https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir torch==2.6.0 --index-url "$TORCH_INDEX_URL" && pip install --no-cache-dir -r requirements.txt && useradd --uid 10001 --create-home app
COPY app.py start.py verified_weights.py model-manifest.json ./
USER 10001
ENV HF_HOME=/tmp/huggingface PORT=8000 PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 HF_HUB_DISABLE_TELEMETRY=1 DO_NOT_TRACK=1
CMD ["python", "start.py"]
