FROM ghcr.io/thepopeblack-byte/pauseam-asr@sha256:7f986b28e1beea961591d55ef435c0acb12434089b7628823281b8b62f3aba7b AS asr
FROM ghcr.io/thepopeblack-byte/pauseam-text_service@sha256:0ed72b3d5db05966fef9b99cfbb02d5009fb23d519abbf895772e1b320830e69
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
