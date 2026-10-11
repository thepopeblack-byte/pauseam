# Move PauseAm inference to a replacement SecretVM

The website remains at https://pauseam.theblockcapitol.com. Replace only its
model compute. These instructions use the English voice + CPU text profile.
They do not launch compute or change the website's production configuration.

## 1. Prepare the replacement

Use at least the previous working resource profile: 8 vCPU, 16 GB RAM and
160 GB persistent disk. This Compose profile does not require a GPU. First
bootstrap needs roughly 40 GB free in the text model volume for downloaded
weights and conversion; leave additional space for images and English ASR.
Check the provider's current billing and available credits yourself before
launching. Previously working hardware is not a latency guarantee.

If you can attach the old persistent volumes to replacement compute, preserve
them. In particular, preserve the `licence` volume containing `usage.sqlite`.
The SecretVM model services use that SQLite ledger as an additional limiter.
The website also reserves actual outbound model requests in its durable D1
ledger. A new empty host ledger must not erase prior licence use. Preserve D1
when moving compute. If the old host ledger cannot be recovered, configure a
conservative prior-user allowance before enabling inference. Do not run both
hosts publicly with independent ledgers.

## 2. Configure SecretVM

1. Open the replacement SecretVM's create/edit screen.
2. Paste the complete contents of `english-complete-compose.yml` into its
   Docker Compose configuration. Use the file beside this guide, not
   `pauseam-compose.yml` or `english-pilot-compose.yml`.
3. In **Encrypted Secrets → Text**, privately paste the complete contents of
   `private/secretvm/deployment.env` from the repository on your PC. Reuse the
   existing `HF_TOKEN`, `TEXT_SERVICE_TOKEN` and `ASR_SERVICE_TOKEN`; those
   service credentials must match the website. Close the secrets panel before
   sharing a screenshot. Never send the file or its contents in chat.
4. The Compose gateway requires `DOMAIN_NAME` at configuration expansion time.
   Use the new VM's bare hostname, with no `https://`, path or trailing slash.
   Do not retain `amaranth-nightingale.vm.scrtlabs.com` on a different host.
   If SecretVM supplies this variable, use its new generated hostname. If it
   reports that the variable is missing, supply it in the environment used to
   expand Compose; do not remove TLS or authentication to bypass the error.
5. Enable persistent storage, save/apply the configuration and launch.

The file contains these services only:

| Service | Image identifier |
| --- | --- |
| gateway | caddy:2, digest starting `0c994536` |
| text | ghcr.io/thepopeblack-byte/pauseam-text_cpu, digest starting `ed76b851` |
| asr-en | ghcr.io/thepopeblack-byte/pauseam-asr, digest starting `02ffaaf9` |

The full immutable image digests are already in the Compose file. Ports 80 and
443 belong to the gateway; model port 8000 stays internal. Do not enable the
Yoruba, Hausa or Igbo containers on this profile.

Keep the model settings already in the Compose file:

| Container | MODEL_BUCKET_ID | MODEL_BUCKET_PREFIX |
| --- | --- | --- |
| text | empty; downloads the pinned official N-ATLaS repository | empty |
| asr-en | Blockcapitol/NigerianAccentedEnglish-bucket | empty |

Do not put a bucket URL in `MODEL_BUCKET_PREFIX`. Do not alter model revisions.

## 3. Wait for real readiness

Open **Docker App** and inspect the running containers, not just the saved
Compose editor. Text downloads and verifies the official weights, converts
them and loads Q4_K_M through llama.cpp. A fresh disk can take substantial
time. ASR also downloads and loads its approved files. Do not repeatedly
restart services while those operations are progressing.

Check these URLs on the new HTTPS host:

```text
https://NEW-HOST/asr/en/ready
https://NEW-HOST/text/ready
```

Both must become HTTP 200. Opening the bare host can return the intentional
404 `PauseAm model gateway`; that is not the readiness check. A 502 on a model
route means its upstream is not reachable yet. If it persists, inspect the
first sanitized startup error. Missing service variables mean the encrypted
secrets did not reach the deployed configuration. Do not expose environment
values while collecting logs.

Send the maintainer the new HTTPS origin only, for example
`https://your-new-vm.vm.scrtlabs.com`. No credentials are needed in chat.

## 4. Reconnect the website

The maintainer first checks authenticated model health and real inference.
English health must match the pinned model/revision and the
`numbers-redacted-v1` policy. Text must match the pinned N-ATLaS revision,
llama.cpp, Q4_K_M and `reviewed-card-relevance-v1` response contract.

Update the existing Sites project's **server-side runtime settings**:

```text
ASR_ENDPOINT=https://NEW-HOST/asr/en/transcribe
TEXT_ENDPOINT=https://NEW-HOST/text/guide
```

Preserve matching `ASR_SERVICE_TOKEN` and `TEXT_SERVICE_TOKEN` as secrets.
Preserve the existing website and storage bindings. Keep unavailable models
disabled until verification passes; then set `ASR_ENABLED=true` and
`TEXT_ENABLED=true`. Deploy the existing saved website version to apply the
new runtime environment revision. Changing a local `.env` file alone does not
update production.

The website's outbound licence guard also requires these server settings:

- `MODEL_LEGACY_USER_UPPER_BOUND`: conservative maximum prior model recipients
  not accounted for in D1, including team members. This is an allowance, not a
  measured participant count. Do not populate validation results from it.
- `MODEL_LEGACY_HOLD_UNTIL`: UTC ISO timestamp at least 30 days after the old
  host stopped serving. The allowance remains in force until this date.

While the hold is active, the new request ceiling is the lesser of 950 and
`1000 - MODEL_LEGACY_USER_UPPER_BOUND`. Missing or invalid migration settings
or D1 storage fail closed before any model request. Only actual new outbound
request timestamps enter D1; no historical interaction rows are invented.
Failed calls retain their reservation. The text step of a voice journey needs
its own reservation. Source-only guidance does not. Keep direct service
credentials private and account conservatively for direct engineering requests.

No frontend source edit, website rebuild, new Sites project or Namecheap DNS
change is needed for this endpoint migration. Keep the website's CNAME at
`custom-domains.chatgpt.site`; do not point it at the model VM.

## 5. Verify before resuming tester sessions

On https://pauseam.theblockcapitol.com, refresh and test:

1. A typed payment question in your own words.
2. An English recording, transcription correction and next steps.
3. A question containing an ordinary amount or date, without credentials.
4. Spoken reply, replay and stop for voice; silent reply for typed questions.
5. Learn with a combined bank-contact question and report-draft download.

Confirm network failure still produces an honest unavailable state. Review
current source validity separately; moving compute does not renew expired
source reviews. Only resume the full tester group after public journeys pass.
Stop the old model workload after the switch, and keep its ledger backup.

## Optional developer verification on the PC

No PC Docker or PowerShell command is required for a dashboard deployment.
For a developer with Node >=22.13, run this from the repository root, replacing
`NEW-HOST` with the real new hostname:

```powershell
node --experimental-strip-types --env-file=private/secretvm/deployment.env scripts/verify-model-host.mjs --host https://NEW-HOST --scope english-complete --mode inference --output private/secretvm/replacement-host-check.json
```

This checks authenticated health and a real authored text request; it does not
test audio without a supplied recording. For a consented non-sensitive mono
16 kHz PCM16 WAV named `en.wav` in `private/consented-audio`, set
`AUDIO_TEST_CONSENT=yes` privately and add
`--audio-directory private/consented-audio`. Neither output is participant
validation or an automatic transcription-accuracy assessment.

Keep the 950-reservation guard and the published 1,000 active-end-user licence
limit within a rolling 30-day period. Self-hosted inference remains separate
from verified official N-ATLaS API access.
