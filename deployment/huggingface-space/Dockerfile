FROM ghcr.io/thepopeblack-byte/pauseam-asr@sha256:79b35cce2f5685928d56ebf09750c4c805ce3f61b95f09f6cb176c13cd952859 AS asr
FROM ghcr.io/thepopeblack-byte/pauseam-text_service@sha256:e12c25884c4bd1ce1de5767a57839366612d5c1e4c16bbccdc37c21c32e9774a
USER root
COPY --from=asr /service /app/asr
COPY --chown=1000:1000 gateway.py launcher.py http_safety.py /gateway/
COPY --chown=1000:1000 approved-sources.json /gateway/
RUN useradd --uid 1000 --create-home space && chown -R 1000:1000 /app /gateway
USER 1000
WORKDIR /gateway
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 HF_HUB_DISABLE_TELEMETRY=1 HF_HUB_DISABLE_PROGRESS_BARS=1 DO_NOT_TRACK=1
EXPOSE 7860
CMD ["python", "launcher.py"]
