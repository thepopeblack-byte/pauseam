# PauseAm on Sites and a custom domain

Status checked 2 October 2026. The app is public at
https://pauseam.theblockcapitol.com. Sites reported domain, provider and TLS
status **active** at 04:24:19 UTC on 2 October. Fifteen actual public API checks
passed through the custom domain at 04:26:02 UTC. The original address
https://pauseam.thepopeblack.chatgpt.site also remains available.

## Namecheap records

In Namecheap: Domain List → Manage theblockcapitol.com → Advanced DNS → Host
Records. If Namecheap says DNS is managed elsewhere, use the authoritative DNS
provider instead. These Host values are relative to theblockcapitol.com:

| Type | Host | Value | TTL |
|---|---|---|---|
| CNAME | pauseam | custom-domains.chatgpt.site. | Automatic |
| TXT | _openai-site-verification.pauseam | openai-site-verification=ELTsXQlkOPNykqHxYT4hHfRepwI7ZLIVjw9UP2enrWM | Automatic |
| TXT | _cf-custom-hostname.pauseam | d012fabf-5005-4cb4-a011-bec0974a3420 | Automatic |

Values above are the actual public DNS verification records returned by Sites.
They are not API credentials. Do not change the root domain, www, mail records or
unrelated subdomains. Inspect an existing record at `pauseam` before replacing
it; a CNAME cannot coexist with A/AAAA/redirect records at that same hostname.
The user saved these records in their own Namecheap browser. Their supplied
screenshot confirms pauseam's CNAME. Root and www records remain unrelated.

The active HTTPS certificate and a fresh browser journey have been verified.
Do not bypass TLS warnings if a future certificate error occurs.
Run the public-app checks against both origins; the API must accept each page's
actual origin while rejecting unrelated origins. Changing DNS requires no
frontend source edit. The app uses same-origin relative API URLs.

References checked 2 October 2026:
- https://learn.chatgpt.com/docs/sites
- https://www.namecheap.com/support/knowledgebase/article.aspx/9646/2237/how-to-create-a-cname-record-for-your-domain/

## Windows publish reproducibility

Use the Sites plugin's native source workflow and save/deploy calls. This
checkout's build passed, but the standard Windows npm launcher resolved the
wrong CLI path inside that workflow. A checkout-local ignored npm.cmd wrapper
invoking the installed C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js
resolved it. No global npm installation or configuration was changed.

The system bash executable invokes WSL and could not read Windows paths. For
this publish only, PATH selected installed C:/Program Files/Git/bin first.
TAR_OPTIONS=--force-local prevented GNU tar treating a C: archive path as a
remote host; the archive argument used forward slashes. Use those process-only
settings on this machine, never change a system-wide PATH or Git safe-directory
policy to solve it. The bundled workflow still owned source push, packaging and
archive validation. Publication succeeded for version 9 from commit
503d084f20661af2e6d74456f56d360e77aa058d. Later commits add review evidence and
verification instructions without changing deployed application runtime code.

## Where the models run

The application and its server-side API proxy already run on Sites. This build
uses a Cloudflare Worker, confirmed by vite.config.ts and its Wrangler build.
The Python/PyTorch text and ASR containers need separate model compute. The
Worker runtime has 128 MB per isolate, while the official text model has eight
billion BF16 parameters. Storing its files in a bucket does not make it a running
inference service. No generic replacement model or browser speech-recognition
fallback is used.

The supplied Hugging Face URLs identify storage buckets. The user subsequently
selected preparation of Hugging Face CPU hosting. Its code-only package and
account instructions are in ../huggingface-space/README.md. No Space or new
SecretVM has been launched for this change.

The prepared target is a Hugging Face Docker Space. Published prices are
CPU Upgrade (8 vCPU / 32 GB) $0.03/hour, or L4 (24 GB GPU / 30 GB system RAM)
$0.80/hour. Account billing eligibility and the exact live price still require
sign-in. The manage-spaces guide describes paid hardware as requiring a payment
method or credits; do not assume a PRO subscription is required or purchase one
automatically. These are quotes, not purchases or guaranteed performance.
An 11-day CPU window would be $7.92 compute before plan, storage, taxes and prior
spend. An L4 could consume $150 in 187.5 hours before those other costs, so it
cannot run continuously through the deadline within the remaining total budget.
Use a short, approved test window only after account eligibility, exact pricing,
model access, persistent licence counting and pause controls are verified.

Hugging Face's default Space disk is ephemeral; attaching a bucket is the
documented persistence route. Do not put the shared SQLite quota on an untested
object-storage mount or reset the quota on restart. This build adds a Sites D1
timestamp-only ledger using atomic conditional inserts before every inference.
Its migration, private credential and production operation must pass before
enabling the pilot. The ephemeral host ledger is only an additional limiter.
The existing Docker images are real, built and import-tested, but a Space
deployment package is now prepared but not running. The text model card lists no
Inference Provider serving it, so no serverless endpoint is assumed.

References:
- https://developers.cloudflare.com/workers/platform/limits/
- https://huggingface.co/NCAIR1/N-ATLaS
- https://huggingface.co/docs/hub/spaces-gpus
- https://huggingface.co/docs/hub/spaces-overview
- https://huggingface.co/docs/hub/spaces-storage
- https://huggingface.co/pricing

## Connecting a genuine inference host

Use submission/04-technical/model-hosting.md and the built model images. The
host must return the adapter's exact pinned identity and response contract;
provider choice does not change the model. The bucket currently verifies Igbo
files only: it has conflicting root files for the other models. Use separate
verified text/en/yo/ha/ig directories or authorised pinned official repositories.

Keep service credentials in server-side Sites secrets. Set TEXT_ENDPOINT to the
actual HTTPS guide route; ASR_ENDPOINT, ASR_YO_ENDPOINT, ASR_HA_ENDPOINT and
ASR_IG_ENDPOINT to the actual transcription routes. Set the matching
TEXT_SERVICE_TOKEN and ASR_SERVICE_TOKEN privately. Endpoint URLs must not
contain embedded credentials or query tokens. Never expose a NEXT_PUBLIC token.

Keep TEXT_ENABLED and ASR_ENABLED false until authenticated health, genuine
text guidance and consented speech requests pass. After runtime settings are
saved in Sites, deploy the existing saved version to activate them; changing a
local .env file does not configure production. Verify from the public app, not
only directly against the model host. Do not tick official N-ATLaS API or
official ASR-service capability solely because a team-hosted endpoint responds.

## Release checks

Node >=22.13, from repository root:

```powershell
node --experimental-strip-types scripts/verify-public-app.mjs --url https://pauseam.thepopeblack.chatgpt.site --output submission/evidence/public-app-check.json
```

Run against the custom origin after DNS/TLS activation. The baseline checks do
not upload audio or claim working models. For the model release gate, prepare
four consented, non-sensitive, mono 16 kHz PCM16 WAV recordings named en.wav,
yo.wav, ha.wav and ig.wav in an ignored private directory. Testers must consent
to the actual host and speak no credentials or numbers. Set AUDIO_TEST_CONSENT
privately to yes, then run:

```powershell
node --experimental-strip-types scripts/verify-public-app.mjs --url https://pauseam.theblockcapitol.com --require-models --audio-directory private/consented-audio --output private/public-model-check.json
```

This performs real requests only. It never writes questions, recordings or
transcripts to the report. A successful contract is not proof of transcription
accuracy, fluent safety wording or usability. Competent speakers still need to
correct transcripts and observe each complete UI journey. Until those checks
and live inference pass, the product remains a review build rather than ready
for PS2 validation or a claimed four-language demo.

## Prepared CPU inference route

The user selected preparation of Hugging Face CPU hosting. See
../huggingface-space/README.md and the code-only upload ZIP in
../../output/huggingface-space. All four separate ASR buckets now fully match
official revisions; earlier mixed-bucket failures remain historical evidence.
The text model uses the approved pinned official repository. No paid Space or
successful new model request is claimed. The app's authenticated D1 quota route
fails closed until its private credential and durable database are available.
