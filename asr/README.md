# Get your Before You Pay transcription URL

This folder is a standalone Docker service that runs the real, pinned
NCAIR1/NigerianAccentedEnglish model. There are no placeholder transcripts.

## Deploy on Render

1. Create a private GitHub repository and upload this folder's contents to the repository root:
   Dockerfile, requirements.txt, app.py, audio_validation.py, start.py and this README.
   Do not upload tokens or recordings.
2. In Render choose **New → Web Service**, connect that repository and select Docker.
   Use the repository root as the build context and ./Dockerfile as the Dockerfile.
3. Choose compute with sufficient RAM for PyTorch plus a 244M-parameter model.
   Around 4 GB is a conservative starting estimate, not a measured requirement.
   Review the host's displayed price before creating a paid service.
   CPU latency must be tested; a slow CPU may exceed the app's 45-second deadline.
4. Add runtime environment variables privately in the Render dashboard:
   - HF_TOKEN: your Hugging Face read token with approved access to the gated NCAIR model.
   - ASR_SERVICE_TOKEN: a new random secret of at least 32 characters.
   - MODEL_REVISION: 3c52c6e6c9ec508014a7b9db6a42b503b8930dff
   - PORT: 10000 (or use Render's supplied PORT).
   Never put these tokens in Git, chat, screenshots, build arguments or URLs.
5. Set the health-check path to /ready and deploy. The service must load the actual model.
   Missing approval, insufficient RAM or an incompatible model download causes deployment to fail;
   it never substitutes another model.
6. When Render reports a successful deployment, copy the HTTPS address displayed on its service page.
   Append /transcribe to that address. That is your ASR_ENDPOINT.
   The /ready route only reports readiness; /health and /transcribe require the service bearer token.
7. Configure the web app with that endpoint and the same ASR_SERVICE_TOKEN as a server secret.
   Then set ASR_ENABLED=true and run a genuinely consented test recording.

Model access alone is not an endpoint. The URL is supplied by the host after deployment.
No paid hosting is purchased by these instructions.

## Generate a service secret

Use a password manager to generate a random 48-character secret.
Copy it directly into the two hosts' secret fields. It is not a banking credential,
and it must not be committed or posted in chat.

## Data policy

Audio is handled in memory and cleared after processing; no audio or transcript is persisted.
Disable request-body logging and tracing at the host/proxy too.
The service authenticates requests, validates mono 16 kHz PCM16 WAV,
limits duration/size/concurrency, and returns the actual model identifier and revision.
The model's separate licence and access requirements still apply.

## Official hosting documentation (checked 2026-10-01)

- https://render.com/docs/web-services
- https://render.com/docs/docker
- https://render.com/docs/configure-environment-variables

