# Technical documentation

PauseAm | Ask before you pay. | Innovation & Enterprise | PS2: Voice-First Access

## Product
PauseAm is a mobile payment decision companion for Nigerian students, everyday users and small businesses. It offers three journeys: check before paying, get bank-first help after a suspected scam, and learn warning signs or find published bank contact information. The first useful action requires no account. The current release supports Nigerian-accented English voice and text.

A voice question produces a transcript for correction and confirmation. The selected guidance is read by a browser/device voice and shown as text with replay and stop controls. Typed questions return silent text. Reports can be previewed, copied or downloaded for the user to send to their bank.

## Architecture
The React 19/TypeScript frontend runs through Vinext/Vite on a Cloudflare Worker hosted by Sites. Same-origin API routes validate input and call authenticated Python/FastAPI model services on SecretVM. The model host has 16 GB RAM, 8 vCPUs and 160 GB disk. The active containers are gateway, text and asr-en.

App: https://pauseam.theblockcapitol.com

Repository: https://github.com/thepopeblack-byte/pauseam

Model host: https://amaranth-nightingale.vm.scrtlabs.com

Version 25 source commit: 37a88225905963275b65eedb1ebf28bdf286f065. Model enablement uses environment revision 4. Documentation updates are tracked separately in Git.

## Voice and guidance flow
Consent -> record -> listen or discard -> upload PCM16 mono 16 kHz WAV -> ASR identity and privacy checks -> correct and confirm transcript -> retrieve current source card -> N-ATLaS relevance check -> independently validated checklist -> device readout and text.

Retrieval selects a reviewed card; the text model may accept it or abstain. Only an eligible card ID can be returned. lib/guidance.ts adds source-derived explanations and small clarifying choices for payment pressure, independent supplier confirmation, missing credit, bank deductions and existing complaints. No arbitrary model-authored contacts or source links enter the answer.

Urgent bank-first actions and the eight-bank contact directory use maintained official-source facts directly. Unknown banks prompt clarification. Expired sources or unavailable required inference produce a clear failure or safe independent-verification route.

## Model configuration
English ASR: NCAIR1/NigerianAccentedEnglish, revision 3c52c6e6c9ec508014a7b9db6a42b503b8930dff. asr/manifests/en.json pins required file hashes. asr/app.py follows the official Transformers pipeline, disables remote code and uses weights-only loading with torch 2.6.

Text: NCAIR1/N-ATLaS, revision e294476928aca9030e924ca27bb8e085e8581273. text_cpu/bootstrap.py verifies official Safetensors/tokenizer files, converts them with llama.cpp revision 631109b34da437a3c4a5ebd75091d677671392e3 and quantizes to Q4_K_M. The engine uses the embedded official chat template. Receipts record original hashes, conversion recipe and output hash. The deployed conversion SHA256 is 3820854be929790f10d171cd6f20dcd4e1ab3ccba095c133144a8dd10d65e49b.

This deployment uses approved model weights and team-hosted inference endpoints. Quantization reduces runtime memory; it is not fine-tuning. The official API adapter is inactive. Organiser confirmation of the self-hosted ASR-service qualification is being sought.

## Setup and tests
Requirements: Node >=22.13, npm and the committed lockfile. Clone the repository, then run npm ci --no-audit --no-fund, npm run dev, npm test, npm run typecheck, npm run lint and npm run build. With the server running, run npm run test:http. Python contracts run with python -m unittest discover -s tests -p 'test_*.py' -v. Production model images use Python 3.11.

Server settings: ASR_ENABLED=true, KB_ENABLED=true and TEXT_ENABLED=true. ASR_ENDPOINT=https://amaranth-nightingale.vm.scrtlabs.com/asr/en/transcribe. TEXT_ENDPOINT=https://amaranth-nightingale.vm.scrtlabs.com/text/guide. ASR_SERVICE_TOKEN and TEXT_SERVICE_TOKEN belong in server secrets; HF_TOKEN is used privately during model preparation.

For SecretVM, follow deployment/secretvm/ENGLISH-COMPLETE.md and deployment/secretvm/english-complete-compose.yml. Preserve model, licence and gateway volumes. The CPU profile limits text to 10 GB, ASR to 3 GB and gateway to 256 MB; these are configured limits rather than measured peak usage. Check authenticated health, then run scripts/verify-model-host.mjs with the English-complete scope and real inference. A downloading or converting container is not ready for requests.

Sites deployment preserves the existing project, domain, audience and D1 bindings. Configure secrets through hosting settings and deploy a saved version after changes. GitHub Actions builds code-only digest-pinned images and checks runtime imports. Model weights and secrets are not embedded in public images.

## API contracts
GET /api/status returns configured capability flags, pinned targets and English scope. GET /api/learn returns eligible dated notices after source-expiry checks.

POST /api/asr requires a matching Origin, Content-Type audio/wav, X-Audio-Consent: yes and X-Language: en. Audio must be PCM16 mono 16 kHz, 0.5-30 seconds and at most 960,044 bytes. Successful responses include actual text, model/revision/language, confidence:null, latencyMs and traceId. Invalid input, missing consent, sensitive output, overload and upstream failure return distinct bounded errors.

POST /api/answer accepts a 1-600-character question, before/after/learn journey and English language. Source and privacy checks precede inference. Successful metadata identifies the actual model/revision, or model:null for source-only responses. Wrong model identity, expired content and invalid card output fail closed.

SecretVM exposes /asr/en/transcribe, /asr/en/ready and authenticated /asr/en/health; text uses /text/guide, /text/ready and authenticated /text/health. llama.cpp listens on loopback behind the gateway.

## Content maintenance
lib/safety.ts records source URLs, sections, review dates and expiry. lib/bank-directory.ts selects official bank contacts before generic guidance. lib/reporting.ts provides complaint-stage actions and user-reviewed report drafts. lib/updates.ts contains selected dated ngCERT notices, not a live news feed.

The notice catalogue expires 9 October, bank facts 17 October and general source/escalation entries 1 November unless rechecked. Kayode coordinates content review; Suleiman publishes reviewed changes with source evidence and checks. Withdraw uncertain or stale entries rather than advancing dates without review. The latest CBN/ngCERT checks used official-domain indexed content where direct requests returned 403.

## Privacy and security
Raw audio, questions and transcripts are processed transiently and are not retained by default. Users are instructed to omit names and banking credentials. Input guards reject PINs, OTPs, passwords, account identifiers and other private numeric content. Ordinary amounts and dates are accepted in typed or corrected questions; ASR hides numeric details before returning transcripts. Numeric values are omitted from text-model relevance requests.

Origin checks, bounded streams, HTTPS-only endpoints, redirect refusal, pinned identities and output allowlists protect the model path. Services serialize inference and reject overload. Containers are non-root, resource-limited and read-only with capabilities dropped. Prompt/access logs and persistent prompt caches are disabled at the inference layer; infrastructure metadata requires separate operational review.

SecretVM provides confidential-computing infrastructure for model hosting. Sites processes plaintext requests before forwarding them over HTTPS. Browser-to-attested-VM end-to-end encryption has not been demonstrated; attestation authenticity and expected-workload matching require verification. The licence ledger stores reservation timestamps rather than question bodies or user identities.

The app allows 90 answer requests and 30 ASR attempts per minute per Worker isolate. The shared persistent pilot ledger allows up to 950 inference reservations in a rolling window, including failures. Preserve its state across restarts. A hung CPU engine is terminated before further inference; audio is not retried automatically.

## Evaluation and verification
The current release passed 80 application tests, type checking, the production build and ten public backend checks. Four checks used the pinned N-ATLaS text model and completed in 5,960-7,803 ms. Earlier six authenticated model-host requests completed in 6,141-6,754 ms. Historical outcomes remain available in dated evidence files.

Thirty people have tested the app; feedback collection is in progress. /evaluation stores consented whitelisted measurements on the device and exports model identities, timing and request references. Observed-session records and scripts/validate-research.py support aggregation. Raw responses remain private; user counts, attempts and completed voice interactions are analysed separately.

Semantic labels, keyboard access, visible focus, touch targets, reduced motion and text alternatives are implemented. Browser overflow checks passed at 320 and 390 pixels. A historical warm emulated-mobile observation measured LCP 332 ms, INP 56 ms and CLS 0.000; it does not represent a cold low-end Android test. Representative device/network and assistive-technology findings will be recorded separately from model latency.

## Operations and licence
Monitor readiness, outcome/latency, memory, disk, restarts and licence consumption without request-body logs. Keep one coordinated pilot ledger and inactive alternate hosts off. The supplied running compute price is $0.24/hour; infrastructure cost estimates must be reconciled with billing.

The published model licence caps active end users at 1,000 within a rolling 30-day period. Obtain separate licensing before exceeding the cap and before commercial model use. Additional languages require capacity and fluent review. The planned revenue service adds human recovery-case support through a legal partner, with a support fee plus an agreed percentage of recovered funds; it is separate from the current free guidance product.

Licence: https://huggingface.co/NCAIR1/N-ATLaS

Challenge: https://ncair.nitda.gov.ng/naic/
