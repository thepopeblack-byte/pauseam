# PauseAm model deployment — user-operated handoff

The application and model-service code are synced with the public GitHub repository.
This guide does not claim that all four voice journeys have passed live testing.
The team-operated host is not proof of the official N-ATLaS API or official ASR
service qualification. No ONDI application has been submitted.

## 1. Fix the bucket layout before deploying

The 2 October byte audit of the supplied bucket root found a complete Igbo model:
13/13 required files, including the entire 967 MB weight, match the official
revision. English, Yoruba and Hausa weights do not match. Shared text-model
configuration/tokenizer files were replaced by ASR files; text shards still exist.
See `submission/evidence/bucket-audit-2026-10-02.json`. A successful earlier text
cache load does not make the current mixed bucket reproducible.

Keep five separate folders inside `Blockcapitol/N-ATLaS-bucket`:

| Folder | Official model | Manifest |
|---|---|---|
| text | NCAIR1/N-ATLaS | text_service/model-manifest.json |
| en | NCAIR1/NigerianAccentedEnglish | asr/manifests/en.json |
| yo | NCAIR1/Yoruba-ASR | asr/manifests/yo.json |
| ha | NCAIR1/Hausa-ASR | asr/manifests/ha.json |
| ig | NCAIR1/Igbo-ASR | asr/manifests/ig.json |

These are required destination folders, not a claim that they already exist.
Copy each complete approved model into its own folder. Never merge their files.
The manifests name every required inference file and its immutable official hash.
Do not copy optimizer, scheduler, RNG, trainer-state or training-argument files.

To preserve the currently verified Igbo files without downloading/re-uploading
their weight, sign in to the Hugging Face CLI yourself and run
`./deployment/secretvm/copy-verified-igbo.ps1`. It first re-audits the source bytes,
copies only required files to `ig/` within the same bucket, then re-audits the
destination. It never deletes the root. This prepared script was not executed
here; source/destination verification must pass when you run it.

If you already have correct local model copies, upload each separately:

```powershell
hf buckets sync YOUR_COMPLETE_IGBO_FOLDER hf://buckets/Blockcapitol/N-ATLaS-bucket/ig --filter-from deployment/secretvm/filters/ig.txt
```

Replace the capitalised local folder with its real path. Repeat using each model's
folder/filter. This adds files without deleting the existing bucket root.
The command and filter format are documented by
[Hugging Face](https://huggingface.co/docs/huggingface_hub/guides/buckets).

Alternatively, after accepting access for every model, use the prepared pinned
download/copy script from the repository root:

```powershell
hf auth login
./deployment/secretvm/copy-models.ps1
```

Authenticate yourself at the private CLI prompt. The preparation account needs
read access to all five models and write access to this bucket. Do not put its
write credential on the inference host. Approximately 20 GB of local disk is
needed. Use a Hugging Face CLI version that exposes `hf buckets sync`; the model
containers' Transformers dependencies are separate. The script has been syntax
checked, but transfers were not executed here. If a gated download fails, stop
and resolve that repository's access; no generic model is substituted.

Check copies read-only, for example:

```powershell
python scripts/audit-model-bucket.py --bucket Blockcapitol/N-ATLaS-bucket --prefix ig --model ig --asr-weight --output private/ig-copy-check.json
python scripts/audit-model-bucket.py --bucket Blockcapitol/N-ATLaS-bucket --prefix text --model text --all-weights --output private/text-copy-check.json
```

Repeat the ASR check for en, yo and ha. `--all-weights` streams about 16 GB for text;
no local weight copy is retained. Without a weight flag, large files are explicitly
marked not downloaded, so complete verification cannot pass. The container also
verifies all bytes before loading and rechecks its persisted cache at each start.

## 2. Upload the actual Compose file

Use `deployment/secretvm/pauseam-compose.yml`. Both GHCR image digests come from
successful build 36959714636, source commit
836fe48cfc826ff8c8afa5f9abde41e5b2300776. The file passed Docker Compose structural
validation. It contains one HTTPS gateway, the actual text model and four distinct
ASR services. It is configuration awaiting deployment, not live inference evidence.

Use the existing `pauseam-model-pilot` if suitable: Google Cloud, Intel TDX,
Production, 8 vCPUs, 32 GB RAM, 160 GB. Quoted runtime is $0.52/hour; stopped
retention is $0.052/hour. Peak simultaneous model memory and useful throughput
still require measurement. No additional VM has been purchased for this handoff.

Keep persistence and runtime privacy enabled. Keep the existing licence volume:
all five services mount the same 950-reservation rolling-30-day SQLite database.
Do not delete, reset or fork it to bypass the model licence ceiling.

Leave the portal's extra Enable HTTPS injection off for this Compose file: its
digest-pinned Caddy gateway already provides certificate-verified HTTPS on 443.
The portal injects `$DOMAIN_NAME`; do not substitute an invented hostname.

Enter `TEXT_SERVICE_TOKEN` and `ASR_SERVICE_TOKEN` through Encrypted Secrets.
Their already generated values are in the ignored private `pilot.env` on your PC;
do not publish, screenshot or paste its contents into chat. Re-enter that private
file yourself if the portal requires it. Bucket folder settings are explicitly
defaulted in Compose. HF_TOKEN can be omitted when all configured mirror files
are publicly accessible; it is used only for the separate direct-repository route.
The private file is never in the ZIP or GitHub repository.

Apply the update and start the VM yourself. Initial 502 responses can occur while
weights download/load; this is not a usable inference result. If the provider
reports Error, inspect its private deployment diagnostics or contact its support.
Do not expose runtime logs or discard persisted data to work around an error.

## 3. Verify the real deployment before enabling the app

All five `/ready` routes must return HTTP 200 with ready=true:
`/text/ready` and `/asr/en/ready`, `/asr/yo/ready`, `/asr/ha/ready`, `/asr/ig/ready`.
The authenticated `/health` routes must match the exact official model revisions.
Use a real provider-issued HTTPS origin in the following command:

```powershell
node --experimental-strip-types --env-file=private/secretvm/pilot.env scripts/verify-model-host.mjs --host https://copper-squirrel.vm.scrtlabs.com --output private/host-check.json
```

This sends a clearly labelled authored engineering question to the real text
model, validates its source selection and checks all five health identities. It
does not claim speech recognition, human comprehension or participant validation.

For actual speech checks, prepare consented, non-sensitive PCM16 mono 16 kHz WAV
recordings named en.wav, yo.wav, ha.wav and ig.wav, each 0.5–30 seconds and at most
960,044 bytes, inside ignored `private/consented-audio`. Speakers must listen first
and remove private details. Set AUDIO_TEST_CONSENT=yes privately, then:

```powershell
node --experimental-strip-types --env-file=private/secretvm/pilot.env scripts/verify-model-host.mjs --host https://copper-squirrel.vm.scrtlabs.com --audio-directory private/consented-audio --output private/speech-check.json
```

The example uses the previously provisioned copper-squirrel domain. If you create
a different VM, replace it with that VM's actual provider-issued HTTPS origin.

The report contains identity, status and measured latency; it does not retain
transcripts or audio. Fluent reviewers must still check transcription accuracy,
correction, comprehension and critical wording. Never use generated speech or
fictional responses as completed human validation.

## 4. Connect the app server after successful checks

Keep ASR_ENABLED=false and TEXT_ENABLED=false until their respective checks pass.
Set these on the Sites server, not in browser code or committed files:

| Variable | Value relative to the real VM origin |
|---|---|
| TEXT_ENDPOINT | /text/guide |
| ASR_ENDPOINT | /asr/en/transcribe |
| ASR_YO_ENDPOINT | /asr/yo/transcribe |
| ASR_HA_ENDPOINT | /asr/ha/transcribe |
| ASR_IG_ENDPOINT | /asr/ig/transcribe |
| TEXT_SERVICE_TOKEN | Secret matching the host |
| ASR_SERVICE_TOKEN | Secret matching the host |
| KB_ENABLED | true while current source content is available |

Use complete HTTPS URLs for endpoint variables. After model tests pass, report
the host ready so the app configuration can be connected, redeployed and tested
through consent → speech → correction → guidance. Urgent after-payment guidance
remains source-based and does not wait for the text model. Current safety wording
and interface are English; four-language fluent review is still pending.

Stop the VM after review/testing within the agreed budget. Stopping preserves
model files and licence accounting but still incurs the quoted retention charge.
Record actual host-hours, latency and failures; do not claim a cost per successful
interaction until there are measured successful interactions.
