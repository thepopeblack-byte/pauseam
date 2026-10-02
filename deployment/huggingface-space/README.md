# PauseAm — Hugging Face CPU pilot

Prepared 2 October 2026. No Space has been created, no paid hardware selected,
and no inference has been performed by this package. The public app is
https://pauseam.theblockcapitol.com. Model endpoint settings remain disabled.

The combined container build and offline imports passed in actual GitHub CI
run 36967883845. All five upload file hashes match the CI package. Sites version
9 has deployed the quota route and created its D1 table; its private credential
is still pending. Sixteen real public baseline checks passed. These checks do
not prove loaded models, transcription, latency or user comprehension.

## What is included

One Docker Space exposes port 7860. A protected gateway forwards to five
loopback-only processes: the actual pinned N-ATLaS text model and the four
official ASRs. It does not generate replacement outputs. One inference at a
time avoids concurrent CPU generation. There are 10-second upload and 55-second
upstream timeouts, strict routes and size limits, no automatic inference retry,
no raw-audio files, and no request-body logging. Failure produces an error.

The four approved ASR buckets were streamed in full and every required file
matched its official pinned revision (13 English, 12 Yoruba, 13 Hausa, 13 Igbo).
Reports are in submission/evidence/asr-bucket-*-2026-10-02.json. These checks
prove bytes, not recognition quality. The mixed text bucket fails small-file
checks. Text therefore loads the pinned official repository using HF_TOKEN.
Remote model code is disabled. Base image digests and model revisions are fixed.

## Prepare the upload

From the repository root, Python 3.11 or newer:

```powershell
python scripts/prepare-hf-space.py
```

Upload the five files in output/huggingface-space at the root of a Docker Space:
Dockerfile, README.md, gateway.py, launcher.py, approved-sources.json. The ZIP
contains precisely those files; extract it before using the web uploader.
package-manifest.json records hashes and is not required by the Space.
Do not upload the repository, private directory, .env, audio or identity files.
The production build does not download weights or read credentials at build time.

## Account, hardware and billing gate

Sign in to the approved Hugging Face account. Create a Docker Space with a name
you choose and the Blank template; do not invent a URL from its name. A private
Space requires Hugging Face authentication in addition to the service bearer,
which this adapter does not implement. For this package use a public code-only
Space with every health/inference route protected by private service tokens;
root and readiness are public. Never publish weights or secrets.

Review the live CPU Upgrade quote and billing eligibility before committing.
Published hardware is 8 vCPU / 32 GB RAM at $0.03/hour, checked 2 October 2026.
Two hours is $0.06; 24 hours is $0.72; 240 hours is $7.20. These are projections,
not bills; add any required subscription, tax, storage, previous SecretVM spend
and stopped-VM retention to the user's $150 total. Do not buy a subscription
without explicit review of that separate cost. CPU Basic's 16 GB is insufficient
for this proposed five-model layout. The 32 GB layout still needs real load/RAM
and latency testing; no throughput or acceptable CPU response time is promised.

suggested_hardware in README only suggests hardware. Select CPU Upgrade
explicitly after review. Set an inactivity sleep time, e.g. 3600 seconds, where
the account supports it. Pause the Space manually after each review/test window
and confirm its paused state. Application errors or process exit are not proof
billing stopped. Do not attach paid persistent storage for this pilot.
Sleeping or pausing loses ephemeral caches; next boot may download weights again.

## Private runtime configuration

Use Space Settings → Variables and secrets. Enter and save credentials yourself;
never paste them into chat or the public README. Required **secrets**:

The ignored local file private/huggingface/space.env has been prepared with
fresh service credentials and the existing private HF read token. To reproduce
locally use python scripts/prepare-hf-secrets.py; it preserves an existing output
instead of silently rotating credentials. Never upload that file into Space Files.

| Key | Value |
|---|---|
| HF_TOKEN | Existing approved read-only token for NCAIR1/N-ATLaS |
| TEXT_SERVICE_TOKEN | Random private value, at least 32 characters |
| ASR_SERVICE_TOKEN | Different random private value, at least 32 characters |
| QUOTA_SERVICE_TOKEN | Different random private value, at least 32 characters |

Required non-secret **variable**:
QUOTA_ENDPOINT=https://pauseam.theblockcapitol.com/api/model-quota.
Configure the exact same QUOTA_SERVICE_TOKEN as a secret in Sites and deploy the
saved app version to apply it. ASR_SERVICE_TOKEN and TEXT_SERVICE_TOKEN must also
match Sites when their endpoints are later enabled. The Space will not infer
without a successful durable reservation. No NEXT_PUBLIC secret is allowed.

Sites' D1 migration creates only timestamp reservations. Atomic conditional
inserts cap all model calls at 950 in 30 days, including failures and the one
documented reservation on the stopped previous host until it expires. Local
SQLite is an additional limiter only. Never clear/fork the persistent counter
or reactivate an old host with an independent counter. This conservative call
cap is stricter than 1,000 active users; a voice question typically consumes
two reservations. Obtain separate Awarri/FMCIDE licensing before exceeding the
published active-user limit. No user ID, question or audio enters the quota DB.

## Start and prove the real service

After account/billing review and private secret setup, start the Space and wait
for all five model_ready events. First loading may be slow. A one-hour startup
deadline and continuous child-process monitoring fail closed. Logs show only
model target and status, not library error text, tokens or input. The gateway
being Running does not prove that all models are ready.

Copy the exact public HTTPS app URL supplied by the running Space. Call the
authenticated /text/health and /asr/en/health, /asr/yo/health, /asr/ha/health,
/asr/ig/health routes using a local private environment; check model IDs,
revisions and provenance against approved-sources.json. Measure load RSS and
request times. Never send tokens in URL queries or print headers.

Only after health passes, privately configure Sites:
TEXT_ENDPOINT = actual Space app origin + /text/guide;
ASR_ENDPOINT = origin + /asr/en/transcribe;
ASR_YO_ENDPOINT = origin + /asr/yo/transcribe;
ASR_HA_ENDPOINT = origin + /asr/ha/transcribe;
ASR_IG_ENDPOINT = origin + /asr/ig/transcribe.
Temporarily enable models only for a controlled release test, then deploy the
saved version. Immediately disable again if any required contract fails.

Use scripts/verify-public-app.mjs with --require-models and four genuinely
consented, non-sensitive mono 16 kHz PCM16 WAVs in an ignored private folder.
No audio has been supplied yet. Test a real question, correct/confirm each
transcript in the UI, inspect sources, and have competent speakers assess
accuracy and safety wording. Check wrong-language, noisy-speech, network,
injection and unavailable-model cases. Keep synthetic engineering tests separate
from the 50 completed human interactions. Publish actual latency and device
conditions. Do not start validation or claim a working four-language demo before
the complete public journey passes.

Self-hosted weights do not prove the official N-ATLaS API or satisfaction of the
PS2 official-ASR-service requirement. Organiser confirmation is still pending.
No fine-tuning is performed here.

Official documentation: https://huggingface.co/docs/hub/spaces-sdks-docker,
https://huggingface.co/docs/hub/spaces-gpus,
https://huggingface.co/docs/huggingface_hub/guides/manage-spaces,
https://huggingface.co/docs/hub/spaces-storage.
