# Verified model sources and portable hosting

All four separate ASR buckets supplied on 2 October passed complete streamed
byte verification against the official pinned revisions. The actual evidence is
submission/evidence/asr-bucket-{en,yo,ha,ig}-2026-10-02.json. English, Hausa and
Igbo each matched 13/13 files; Yoruba matched 12/12. Each check includes its full
967 MB pytorch_model.bin. No weights were retained locally. This proves model
file identity, not transcription or accuracy.

approved-sources.json maps the real bucket IDs and official revisions. The text
model's mixed bucket root still fails its small-file checks. The prepared
portable host therefore uses the official pinned text repository with approved
HF_TOKEN access; the ASRs use their individually verified public buckets. Do not
use one language's weights for another language.

model-compose.yml is a **prepared Docker Compose configuration**, suitable for
a compatible Linux host with persistent Docker volumes and a real HTTPS
hostname. It is not directly deployable into a Sites Worker or an unmodified
Hugging Face Space (which does not run this Compose stack). It uses the existing
actual digest-pinned CPU images, a TLS gateway and one persistent shared licence
database. Neither a host nor container was launched by preparing this file.

The combined CPU stack needs at least 32 GB RAM and measured headroom, plus
storage for roughly 20 GB of verified model files and images. Simultaneous
capacity, inference latency and meaningful guidance must be tested. The current
PC has 31.8 GB RAM, four cores/eight logical processors and a Quadro P520, but its
Docker Linux daemon is unavailable; no local model serving is claimed.

Generate the configuration reproducibly from repository root:

```powershell
python scripts/prepare-model-host.py --text-image ghcr.io/thepopeblack-byte/pauseam-text_service@sha256:e12c25884c4bd1ce1de5767a57839366612d5c1e4c16bbccdc37c21c32e9774a --asr-image ghcr.io/thepopeblack-byte/pauseam-asr@sha256:79b35cce2f5685928d56ebf09750c4c805ce3f61b95f09f6cb176c13cd952859 --output deployment/models/model-compose.yml
```

On the selected host, supply MODEL_HOSTNAME, HF_TOKEN, TEXT_SERVICE_TOKEN and
ASR_SERVICE_TOKEN privately. The two service credentials must be at least 32
random characters. Keep MODEL_BUCKET_ID empty for text until a complete text
bucket is verified. Root-level ASR copies use an empty prefix by default. The
ASR_*_BUCKET_ID and ASR_*_BUCKET_PREFIX settings allow explicit verified changes.
Never expose container ports 8000 directly or reset/fork the rolling licence
quota to regain capacity. Do not print expanded Compose configuration containing
secrets; use `docker compose --env-file PRIVATE_FILE -f deployment/models/model-compose.yml config --quiet`.

Use scripts/verify-model-host.mjs for actual authenticated health and inference
checks, then configure Sites only after they pass. Its ASR routes are
/asr/{en,yo,ha,ig}/transcribe, and text is /text/guide. Set the actual HTTPS
routes and matching server secrets in Sites; deploy the saved app version to
activate runtime changes. Use scripts/verify-public-app.mjs through the custom
domain for the final API-chain check. These are team-hosted services, not proof
of the official N-ATLaS API or organiser approval of self-hosted PS2 ASR.

The app and custom-domain guide is in deployment/sites/README.md. Compute host
selection and live text/voice verification remain pending. No fine-tuning,
four-language comprehension, completed user interaction or demo video is claimed.
