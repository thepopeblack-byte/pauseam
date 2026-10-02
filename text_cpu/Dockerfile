FROM python:3.11-slim@sha256:9f6ef439f51f4b36dc5c6bb265c2d3dd810bde94c5bbec77ae86b6650c488cf9 AS engine
RUN apt-get update && apt-get install -y --no-install-recommends git cmake g++ make ca-certificates && rm -rf /var/lib/apt/lists/*
RUN git init /opt/llama-src && cd /opt/llama-src && git remote add origin https://github.com/ggml-org/llama.cpp.git && git fetch --depth 1 origin 631109b34da437a3c4a5ebd75091d677671392e3 && git checkout FETCH_HEAD && test "$(git rev-parse HEAD)" = 631109b34da437a3c4a5ebd75091d677671392e3
RUN cmake -S /opt/llama-src -B /opt/llama-src/build -DCMAKE_BUILD_TYPE=Release -DGGML_NATIVE=OFF -DGGML_CPU_ALL_VARIANTS=ON -DLLAMA_BUILD_TESTS=OFF -DLLAMA_BUILD_EXAMPLES=OFF -DLLAMA_BUILD_APP=OFF -DLLAMA_BUILD_UI=OFF -DLLAMA_OPENSSL=OFF && cmake --build /opt/llama-src/build --target llama-server llama-quantize -j 2

FROM python:3.11-slim@sha256:9f6ef439f51f4b36dc5c6bb265c2d3dd810bde94c5bbec77ae86b6650c488cf9
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 ca-certificates && rm -rf /var/lib/apt/lists/* && useradd --uid 10001 --create-home app
COPY --from=engine /opt/llama-src/build/bin /opt/llama/bin
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
