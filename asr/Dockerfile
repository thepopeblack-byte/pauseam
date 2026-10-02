FROM python:3.11-slim
WORKDIR /service
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 HF_HUB_DISABLE_TELEMETRY=1 DO_NOT_TRACK=1 HF_HOME=/tmp/model-cache
COPY requirements.txt .
ARG TORCH_INDEX_URL=https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir torch==2.6.0 --index-url "$TORCH_INDEX_URL" && pip install --no-cache-dir -r requirements.txt
COPY app.py audio_validation.py start.py ./
RUN useradd --uid 10001 --create-home inference
USER inference
EXPOSE 8000
CMD ["python", "start.py"]


