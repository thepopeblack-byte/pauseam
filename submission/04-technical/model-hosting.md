# Secure model hosting — PauseAm

Current selected preparation: Hugging Face CPU Upgrade. Follow
../../deployment/huggingface-space/README.md for the five-model package,
protected gateway, durable Sites quota, private configuration and billing gate.
No new Space has been launched. Four separate ASR buckets now fully match
official revision hashes; the mixed text root must not be loaded. Instructions
below also describe earlier direct-container options and historical access checks.

No inference URL exists until a service is actually deployed. Do not use the
Hugging Face model-card URL as an inference endpoint.

## Account action and access
Sign in yourself to Hugging Face. Read and accept the publisher's conditions for
all five NCAIR1 repositories linked in access-and-models.md. Use a least-privilege
read token restricted to the approved repositories. Enter it only in your model
host's secret settings as HF_TOKEN. Never send tokens, passwords or OTPs in chat.
The initial unauthenticated request returned 401. Check current private access
without exposing the token; that historical result does not invalidate the new
approved ASR bucket copies.

## ASR deployment
Build from the repository root with `docker build -f asr/Dockerfile .`.
Use an HTTPS container host that can run
Python/PyTorch, with memory and startup timeout sufficient for the official model.
Choose and review pricing yourself before provisioning paid resources.

Deploy one service for each language. Set MODEL_LANGUAGE to en, yo, ha or ig and
MODEL_REVISION to the exact matching SHA in lib/models.ts. Set HF_TOKEN privately
and generate a random ASR_SERVICE_TOKEN with at least 32 characters in a password
manager. Use the same service token only across these team-controlled ASR services;
rotate it in all relevant host secret settings after exposure. PORT defaults to 8000.

The host provides an actual HTTPS origin when deployment succeeds. Use /ready as
its health check; use authenticated /health to verify the exact loaded identity.
The actual origin plus /transcribe is the web adapter's endpoint URL.
Put those URLs into ASR_ENDPOINT (English), ASR_YO_ENDPOINT, ASR_HA_ENDPOINT and
ASR_IG_ENDPOINT on the web host, with ASR_SERVICE_TOKEN as a secret. Keep
ASR_ENABLED=false until tests, retention settings and licence controls are ready.

The original Render guide in asr/README.md is one hosting option, not an active
deployment or a purchase recommendation. No third-party account was created.

## Text deployment
Build from the repository root with `docker build -f text_service/Dockerfile .`
on suitable memory/compute.
Set MODEL_REVISION=e294476928aca9030e924ca27bb8e085e8581273, HF_TOKEN and a separate
TEXT_SERVICE_TOKEN of at least 32 random characters. Check /ready and authenticated
/health. Set the real HTTPS /guide URL as TEXT_ENDPOINT and the matching secret
on the web host. Keep TEXT_ENABLED=false until real held-out tests pass.

This service follows the documented NCAIR text-model loading and chat template,
and has now loaded the pinned text weights on the original team-host image. Its
first guidance output failed the strict contract. The final decoder constrains
actual token choices and needs a live retest. Failure must stay visible, never replaced
with generic model output. Four-language source wording still needs fluent review.

## Operation
Use persistent, access-controlled weight caches. Disable access/request-body/model
output logging, verify platform retention, set TLS and a shared edge request cap,
bound compute spending and alert on error rates without recording content.
No automatic audio retry is implemented; users retry deliberately.
Before public inference, verify a controlled pilot roster/licence accounting under
1,000 active end users across any rolling 30 days. Obtain separate licensing before
growth beyond that. A per-process rate limit is not licence enforcement.

Record actual container digest, package lock, model SHA, health response, real
request trace and measured latency after successful setup. A self-hosted endpoint
does not establish official API use or organiser acceptance for PS2.

## Reproducible CPU pilot preparation (2 October 2026)

The SecretVM portal lists a Google Cloud xlarge with eight vCPUs and 32 GB RAM,
at $0.52/hour, with stopped storage billed at $0.052/hour. This is a quoted
configuration. The original text pilot subsequently ran and loaded its verified
weights; the final five-service handoff awaits user deployment. Secret Cloud's 16 GB option
does not provide sufficient headroom for these five services together.

The model-container workflow builds two Linux amd64 images from the exact Git
commit and reports their actual registry digests. It does not download weights or
receive Hugging Face credentials. Official build actions are pinned to commits.
Dockerfiles default to the official PyTorch CPU wheel index. A GPU deployment
must explicitly select its compatible official PyTorch wheel index and be tested.

On the CPU pilot, TEXT_DTYPE=bfloat16 reduces text-weight memory; MODEL_THREADS=4
limits text threads, and each ASR uses MODEL_THREADS=1. The original text dtype
was observed at runtime; simultaneous five-service capacity remains unvalidated.
Throughput, peak memory, startup and
inference latency must be measured before enabling the app's inference switches.

An optional MODEL_BUCKET_ID uses model_service/verified_weights.py. It downloads
only the files in model-manifest.json and checks actual SHA-256 hashes for large
files and Git blob SHA-1 hashes for small files against metadata from the official
revision. It verifies all cached files again on every startup. It rejects changed,
incomplete or unexpected files; a bucket URL or Xet hash alone is insufficient.
The bucket ID is private deployment configuration, not an official API endpoint.
No successful full-weight verification or inference is claimed by unit tests.

Every model container requires LICENSE_DB pointing to the same persistent SQLite
file on a shared volume. model_service/license_quota.py atomically reserves each
inference and limits the deployment to 950 reservations per rolling 30 days.
Failures also consume reservations. This conservative ceiling bounds distinct
direct recipients below 1,000 without storing user IDs, questions or audio. It is
stricter than active-user accounting and may exhaust during testing. Do not reset
or fork the database to bypass the cap; separate licensing is required for growth.
