# 04 — Technical documentation

PauseAm — Ask before you pay.
Innovation & Enterprise / PS2. Review build, 1 October 2026.

## Implemented behaviour and limits
A no-account mobile interface offers before-payment, after-payment and learning
journeys. Typed English situations retrieve source-linked CBN checklists covering
supplier changes, school fees, receipt claims, impersonation, banking codes,
shopping, investment warnings and suspected fraud. It never declares a person,
account or payment safe. Source checks are automated; human safety review is pending.

After-payment bank-contact advice is immediate. Incident notes contain only selected
event categories and times in page memory. Downloads and sharing exclude questions,
transcripts and credentials. The learning interaction explains a code-sharing trap.
User usefulness has not yet been demonstrated.

Four official ASR routes and an N-ATLaS text adapter exist. Live inference, four-language
comprehension and fluent review are unverified. Current interface and source wording
are English. No official API success, fine-tuning, receipt authentication or screenshot
redaction is claimed.

## Architecture and data flow
Frontend: React 19, Vinext, Vite, TypeScript, system fonts, responsive CSS and existing
Radix controls. Backend: same-origin Cloudflare Worker routes, no bound database.
Inference: separately configured Python 3.11 FastAPI HTTPS services.

Voice: consent → record up to 28 seconds → listen/discard → mono 16 kHz PCM16 WAV →
bounded upload → authenticated host → exact pinned model → contract checks →
user-corrected and confirmed transcript → source-grounded checklist.
Browser recognition is not a fallback. Browser read-aloud is labelled and receives
public guidance only.

ASR follows the official Transformers pipeline. Current weight files are
pytorch_model.bin, so the service uses torch 2.6 weights-only loading with remote
code disabled. Text uses official Safetensors and the documented chat-template path.
Authenticated loading of these weights still requires verification.

## Setup and reproducibility
Use Node >=22.13 and Python 3.11 for inference. Clone the public repository.
Run npm ci --no-audit --no-fund, npm run dev and open the printed local URL.
Run npm test, npm run typecheck, python -m unittest tests.test_audio -v,
npm run build, and npm run test:http against the running server.
For production preview run npm run start after building.

The JavaScript lockfile is committed. New npm install-script policy allows only six pinned esbuild, workerd and unrs-resolver build dependencies; no blanket script permission is enabled. Temporary verification clones are excluded from TypeScript scanning. The Windows npm.cmd shim may need the installed
npm-cli.js invoked through node. Python direct dependencies are pinned; transitive
Python resolution and Docker base-image digests are not yet frozen. A fresh
authenticated container build is needed before claiming reproducible model deployment.

Keep tokens in server-side host secret settings. Never put them in a NEXT_PUBLIC
variable, source, screenshot or chat. Use .env.example for key names and safe defaults.
.env, .dev.vars, private research, raw recordings and identity documents are ignored.
See model-hosting.md for deployment and secure account setup.

## API contracts
GET /api/status returns pinned targets, library version and configuration flags.
It performs no inference; configuration is not validation.

POST /api/asr requires matching Origin, Content-Type audio/wav, X-Audio-Consent: yes
and X-Language en/yo/ha/ig. Body: canonical PCM16 mono 16 kHz WAV, 0.5–30 seconds,
maximum 960,044 bytes. Success: actual text, model, revision, language, confidence:null,
latencyMs. Errors: invalid consent/language 400, origin 403, media 415, private output
422, capacity 429, inference unavailable 503. No synthetic transcript.

POST /api/answer accepts question (1–600 characters), journey before/after/learn and
language. Privacy/source checks precede inference. Urgent response does not await a
model. The optional text service may select at most one trusted card ID or abstain.
Wrong identity, unknown IDs, malformed or oversized responses fail closed.

Model-host /ready reports readiness; authenticated /health returns model/revision.
ASR /transcribe accepts WAV. Text /guide accepts the corrected situation and
server-supplied source context. These are team-host contracts, not official API proof.

Evaluation JSON schema 2 labels its four-model catalog as targets, not inference evidence. Consented successful ASR trials retain only verified model ID/revision, selected language and anonymous counts/latency. Language rows do not assign old records without a target to English. No text, audio or participant identifier is retained. Local records can be modified by the browser owner and are not audited field validation.

## Source management
lib/safety.ts is the versioned registry: URL, section, checked date, expiry and
review status accompany each entry. Scenario adaptations are distinguished from
CBN facts. Source details are expandable next to answers. The complaint PDF returned
403 during recheck, so the official Complaint Lodgment HTML page is used instead.
Users check current applicable complaint timelines at the source, while urgent
fraud reporting is immediate.

Proposed owners: Kayode coordinates safety review; Suleiman deploys approved content.
Review monthly and after reported changes. This version expires 1 November 2026.
Disable uncertain entries. Changes need current source evidence, human sign-off,
tests and a version bump. No human sign-off has been invented.

## Privacy and security
Do not enter names, account details, PINs, OTPs, passwords or full credentials.
The guard rejects digits, emails, common secret phrases and English digit-word
sequences. It cannot recognise every sensitive expression or language. Speakers
must listen before uploading. Screenshot input stays disabled.

Input text/audio are transient. Mutable PCM buffers are cleared where possible;
managed-runtime copies cannot be guaranteed erased immediately. No application
database or request-body/transcript log exists. Operators must verify host and
proxy logging/retention independently. Network providers may process IP metadata.

Protection includes origin checks, bounded streams, HTTPS-only configured hosts,
redirect refusal, pinned identity and strict output allowlists. Answer requests
are limited to 90/minute and ASR to 30/minute per isolate; model hosts serialize
inference. Add distributed edge limits before public model use; these controls
are not a global abuse, spending or licence cap. No automatic inference retry
re-uploads audio. Users may retry deliberately after a failure.

Pasted messages are untrusted data. Retrieval cannot execute instructions. Model
outputs cannot introduce links, contacts or free-form advice. Relevance and prompt
injection robustness still need real-model adversarial evaluation; contract tests
do not prove immunity.

## Accessibility and performance
Semantic headings, labelled inputs, keyboard controls, skip link, visible focus,
large touch targets, high-contrast colours, reduced motion and a text alternative
are implemented. Record actual browser, screen-reader and mobile checks separately.
No WCAG certification is claimed; TalkBack/NVDA and fluent-language testing remain.

Web Vitals measures real LCP, INP and CLS only in page memory. Values are not uploaded.
Record device, viewport, network/CPU conditions, cache, build and sample count.
Development cold compilation is not representative mobile performance. Separate
ASR/answer latency from page responsiveness. Targets: LCP <=2.5 s, INP <=200 ms,
CLS <=0.1. Targets are not achieved results.

## Tests and deployment
Tests cover retrieval, expiry, urgent priority, abstention, privacy, telemetry
whitelists, Unicode WER, invalid audio, stream bounds, cancellation, wrong language
or model identity, unavailable endpoints and constrained source selection.
Transport fixtures are explicitly test-only and excluded from validation.
Python checks cover truncated/oversized/wrong-format PCM; HTTP checks exercise
actual app routes without claiming model inference.

Build the Worker, push its exact commit, package and deploy through Sites.
Validate public fresh-session access on desktop/mobile. Configure model hosts
separately, verify /health, then run genuine consented WAV requests and the full
correction flow in every claimed language. ASR_ENABLED=false and TEXT_ENABLED=false
are kill switches. Roll back the previous site version if release checks fail.

## Fine-tuning
Not performed. After access, reviewed data and suitable compute, use narrowly scoped
card-selection LoRA/QLoRA. Split by scenario/person before training; de-duplicate;
freeze multilingual, adversarial and abstention evaluation cases. Use only consented
or authored, reviewed non-sensitive data with documented rights. Record hashes,
seed, hardware, time, hyperparameters and adapter checkpoint.

Compare unchanged pinned N-ATLaS and the adapter on identical held-out cases.
Report selection accuracy, abstention, unsupported advice, per-language human
review and latency/cost. Downloading or running weights is not fine-tuning.
No dataset, run or improvement has been fabricated.

## Sustainability and licence
Local GPU: Quadro P520, 4 GiB. It is not evidence of an 8B training run.
Hosting quotes and load measurements are pending. Calculate costs from measured
host-hours, actual dated rates, egress, storage, monitoring, content review and
support; disclose assumptions and currency. No unverified price is a cost result.

Model terms cap use at 1,000 active end users per rolling 30 days. Obtain separate
Awarri/FMCIDE licensing before exceeding it. Restrict the pilot and verify cross-host
user accounting before public inference. A cookie is not reliable person counting.
Required model attribution is in the app and integration register. Public source
availability does not grant rights to third-party model weights.

## Remaining release gates
Actual model credentials/hosts and traces, official service/API clarification,
fluent review, human safety review, 50 documented interactions, representative
mobile/assistive testing, real video, full second-member details and private ID/CAC
are pending. ONDI pages 1–2 were inspected and local drafts fit verified limits; Programme Fit and remaining constraints are pending. Section navigation auto-saved the pre-existing draft without field edits. The session subsequently returned to sign-in. Nothing has been submitted.
