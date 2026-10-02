# Deploy PauseAm inference on SecretVM yourselves

Keep the app on https://pauseam.theblockcapitol.com. Deploy only inference on
SecretVM. No VM is launched by these files; live inference and CPU latency remain
unverified. SecretVM supports Docker Compose and encrypted environment variables:
[official launch guide](https://docs.scrt.network/secret-network-documentation/secretvm-confidential-virtual-machines/launching-a-secretvm).

## 1. Upload the current stack

Use deployment/secretvm/pauseam-compose.yml in the SecretAI portal. It exposes
one HTTPS Caddy gateway on ports 80/443; all five model services stay internal.
Keep the portal's extra HTTPS injection off for this stack. The portal supplies
DOMAIN_NAME. Do not change the app's DNS.

Use at least 32 GB RAM and disk for roughly 20 GB of weights plus images/cache.
This is an estimate; concurrent memory, throughput and latency need measurement.
The CPU text model may exceed the app's 45-second model timeout. Review current
provider pricing yourselves; stay within the agreed $150 total through 12 October,
stop after testing and include stopped-storage charges.

Before changing an existing VM, verify upgradeability and preservation of encrypted
state: [official upgrade guide](https://docs.scrt.network/secret-network-documentation/secretvm-confidential-virtual-machines/managing-secretvm-lifecycle/secretvm-upgradeability).
A non-upgradeable VM can lose old state on workload change. Preserve the licence
database; never reset or fork it. Enable persistence and runtime privacy.

Actual built image digests and source commit are in
submission/evidence/model-container-review-2026-10-02.json. Both host generators
use one model mapping. The Hugging Face Space alternative should stay inactive;
independent simultaneous licence ledgers could exceed the aggregate limit.

## 2. Prepare credentials privately

From the repository root:

```powershell
python scripts/prepare-secretvm-secrets.py
```

Open the ignored private/secretvm/deployment.env yourself. The script copies only
HF_TOKEN and service credentials from the old private file, or generates random
service credentials if missing. It excludes obsolete bucket overrides and leaves
an existing deployment.env unchanged. Do not paste the old pilot.env as the new
complete deployment configuration.

Ensure HF_TOKEN has approved read-only access to NCAIR1/N-ATLaS. Enter HF_TOKEN,
TEXT_SERVICE_TOKEN and ASR_SERVICE_TOKEN yourself in Encrypted Secrets → Text.
Collapse the panel. Never publish, screenshot or send their values in chat.

| Service | Configured source |
|---|---|
| Text | Official pinned NCAIR1/N-ATLaS repository, private HF_TOKEN |
| English ASR | Blockcapitol/NigerianAccentedEnglish-bucket |
| Yoruba ASR | Blockcapitol/Yoruba-ASR-bucket |
| Hausa ASR | Blockcapitol/Hausa-ASR-bucket |
| Igbo ASR | Blockcapitol/Igbo-ASR-bucket |

The four separate ASR buckets passed complete byte audits on 2 October. Containers
verify all required bytes before loading. No bucket re-upload is needed. Do not use
the old mixed N-ATLaS bucket root: its text configuration is inconsistent.
The older copy scripts are recovery utilities, not steps in this procedure.

All five services share a persistent 950-request rolling-30-day ledger; failures
also reserve capacity. This is deliberately stricter than unique-user counting.
Obtain separate licensing before exceeding the published 1,000-active-user limit.

## 3. Start and check inference

Start the VM yourselves. Downloads/loading take time. A 502/503 is a failed check,
not a model result. Use your actual provider-issued HTTPS origin below:

```powershell
node --experimental-strip-types --env-file=private/secretvm/deployment.env scripts/verify-model-host.mjs --host https://YOUR_VM_HOSTNAME --output private/secretvm/host-check.json
```

This checks all five identities and performs a labelled engineering text request.
Ready routes are /text/ready and /asr/{en,yo,ha,ig}/ready. The report retains status
and latency, not transcript/question text. It does not prove speech recognition.

For speech, get recording consent, listen first and prepare non-sensitive mono
16 kHz PCM16 WAV files en.wav, yo.wav, ha.wav and ig.wav in the ignored
private/consented-audio folder. Each must be 0.5–30 seconds and ≤960,044 bytes:

```powershell
$env:AUDIO_TEST_CONSENT='yes'
node --experimental-strip-types --env-file=private/secretvm/deployment.env scripts/verify-model-host.mjs --host https://YOUR_VM_HOSTNAME --audio-directory private/consented-audio --output private/secretvm/speech-check.json
Remove-Item Env:AUDIO_TEST_CONSENT
```

Fluent speakers must inspect actual transcription/correction and safety wording.
Never count fixtures or generated speech as completed human validation.

## 4. Connect Sites after the checks pass

Keep ASR_ENABLED=false and TEXT_ENABLED=false until corresponding tests pass.
Set the following server-side, with full HTTPS URLs and matching private tokens:

| Sites setting | Value |
|---|---|
| TEXT_ENDPOINT | https://YOUR_VM_HOSTNAME/text/guide |
| ASR_ENDPOINT | https://YOUR_VM_HOSTNAME/asr/en/transcribe |
| ASR_YO_ENDPOINT | https://YOUR_VM_HOSTNAME/asr/yo/transcribe |
| ASR_HA_ENDPOINT | https://YOUR_VM_HOSTNAME/asr/ha/transcribe |
| ASR_IG_ENDPOINT | https://YOUR_VM_HOSTNAME/asr/ig/transcribe |
| TEXT_SERVICE_TOKEN | Private value matching SecretVM |
| ASR_SERVICE_TOKEN | Private value matching SecretVM |
| KB_ENABLED | true while current reviewed sources are available |
| ASR_ENABLED / TEXT_ENABLED | true after successful corresponding checks |

Deploy runtime settings, then run:

```powershell
node --experimental-strip-types scripts/verify-public-app.mjs --url https://pauseam.theblockcapitol.com --require-models --output private/secretvm/app-check.json
```

The release gate still needs consent → recording → correction → guidance in each
language, real mobile/network measurements and fluent comprehension review.
Current checklists remain English. Urgent after-payment guidance uses source
content without waiting for the model.

Share only the HTTPS origin and non-sensitive results when ready. Self-hosting
official weights is not proof of official N-ATLaS API access or organiser approval
of the PS2 official-ASR-service requirement. No fine-tuning or ONDI submission
has been performed.

