FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && useradd --uid 10001 --create-home app
COPY app.py start.py ./
USER 10001
ENV HF_HOME=/tmp/huggingface PORT=8000
CMD ["python", "start.py"]
