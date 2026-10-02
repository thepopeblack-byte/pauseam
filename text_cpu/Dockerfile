FROM python:3.11-slim@sha256:9f6ef439f51f4b36dc5c6bb265c2d3dd810bde94c5bbec77ae86b6650c488cf9 AS engine
RUN apt-get update && apt-get install -y --no-install-recommends git curl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN git init /opt/llama-src && cd /opt/llama-src && git remote add origin https://github.com/ggml-org/llama.cpp.git && git fetch --depth 1 origin 631109b34da437a3c4a5ebd75091d677671392e3 && git checkout FETCH_HEAD && test "$(git rev-parse HEAD)" = 631109b34da437a3c4a5ebd75091d677671392e3
RUN curl -fsSL https://github.com/ggml-org/llama.cpp/releases/download/b11351/llama-b11351-bin-ubuntu-x64.tar.gz -o /tmp/llama.tar.gz && echo 'c800a3402548d57f408adcebe4e53b939141e34e09b7e4701c785435572d1fee  /tmp/llama.tar.gz' | sha256sum -c - && mkdir -p /opt/llama/bin && tar -xzf /tmp/llama.tar.gz -C /opt/llama/bin --strip-components=1 && rm /tmp/llama.tar.gz

FROM python:3.11-slim@sha256:9f6ef439f51f4b36dc5c6bb265c2d3dd810bde94c5bbec77ae86b6650c488cf9
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 libcurl4t64 libssl3t64 ca-certificates && rm -rf /var/lib/apt/lists/* && useradd --uid 10001 --create-home app
COPY --from=engine /opt/llama/bin /opt/llama/bin
COPY --from=engine /opt/llama-src/convert_hf_to_gguf.py /opt/llama-src/convert_hf_to_gguf.py
COPY --from=engine /opt/llama-src/conversion /opt/llama-src/conversion
COPY --from=engine /opt/llama-src/gguf-py /opt/llama-src/gguf-py
COPY text_cpu/requirements.txt ./
RUN pip install --no-cache-dir torch==2.6.0 --index-url https://download.pytorch.org/whl/cpu && pip install --no-cache-dir -r requirements.txt && pip install --no-cache-dir --no-deps /opt/llama-src/gguf-py
COPY text_cpu/app.py text_cpu/bootstrap.py text_cpu/contract.py ./
COPY text_service/model-manifest.json ./
COPY model_service/http_safety.py model_service/license_quota.py model_service/verified_weights.py ./
RUN mkdir -p /home/app/models /home/app/license && chown -R app:app /home/app
USER 10001
ENV HF_HOME=/home/app/models/hf HF_HUB_DISABLE_TELEMETRY=1 HF_HUB_DISABLE_PROGRESS_BARS=1 DO_NOT_TRACK=1 PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 LD_LIBRARY_PATH=/opt/llama/bin
CMD ["python", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--no-access-log", "--log-level", "warning"]
