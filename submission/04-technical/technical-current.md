# 04 - Technical documentation

PauseAm - Ask before you pay. Innovation & Enterprise / PS2. Review copy, 2 October 2026. English scope; not submitted. Historical documents remain separately dated and must not be treated as current capability statements.

## Product and hosting

The no-account mobile app offers Ask a question, Report a problem and Learn. Users describe a short payment concern by English voice or text, review/correct transcripts and receive practical source-backed actions. Reports remain drafts for private bank/CBN use; PauseAm does not send them or promise recovery. Learn has selected dated ngCERT notices, not a live feed. Consumer technical clutter was removed at Kayode's request; detailed provenance remains in backend metadata/evaluation/evidence.

Sites serves https://pauseam.theblockcapitol.com; GitHub source is https://github.com/thepopeblack-byte/pauseam. The existing team model host is https://amaranth-nightingale.vm.scrtlabs.com. The supplied VM has 16 GB RAM, 8 vCPUs and 160 GB disk. English ASR is connected. Source retrieval currently supplies typed/corrected guidance; N-ATLaS text remains disabled until the new CPU candidate passes actual tests. Other languages are paused.

## Architecture and data flow

React 19, TypeScript, Vinext/Vite, system fonts and responsive CSS form the browser UI. Same-origin Cloudflare Worker routes validate input and keep model credentials server-side. Separate Python/FastAPI services run pinned official models with serialized inference. The active SecretVM ledger stores timestamps only. The prepared inactive alternate-host package uses a D1 reservation route; do not run separate uncoordinated ledgers in parallel.

Voice: consent -> recording up to 28 seconds -> listen/discard -> upload consent -> PCM16 mono 16 kHz WAV -> bounded authenticated ASR -> official identity/privacy validation -> transcript correction and explicit confirmation -> current sources -> optional text-model selection -> validated checklist. Browser speech recognition and other general models are not concealed substitutes. Browser read-aloud uses public guidance only.

Urgent bank-contact steps are maintained content and bypass the model. The text model can select zero or one current card, then independent validation resolves that ID to source-authored wording. It cannot introduce arbitrary prose, contacts, source URLs, confidence scores or safe verdicts. Relevance still requires real-model testing; grammar correctness alone is insufficient.

## Reproduce the application

Use Node >=22.13. Clone the repository and run npm ci --no-audit --no-fund, npm run dev, npm test, npm run typecheck, npm run lint and npm run build. With a server running, run npm run test:http. Python contracts: python -m unittest discover -s tests -p 'test_*.py' -v. The lockfile is committed. Preserve the established package manager/build scripts; Windows preview wrappers are ignored .sites-runtime state. Inference images use Python 3.11; local isolated conversion preparation used Python 3.12.

Sites publishing uses the existing project appgprj_6ab826bba8f48191ad36895acae09407 and its installed workflow. Preserve domain, audience and bindings. Runtime values belong in Sites, not .openai/hosting.json. Deploy a saved version after any settings change. No local Docker/PowerShell deployment is required for an owner dashboard update; local build commands are optional reproduction/verification tools.

GitHub Actions builds code-only model images with pinned base images and actions, records actual digests and checks imports/binary dependencies offline. Never embed weights or secrets in public images. A successful image import is not inference evidence. Use actual digests after a successful build, not a guessed tag or placeholder.

## Model identities and CPU preparation

English ASR: NCAIR1/NigerianAccentedEnglish at 3c52c6e6c9ec508014a7b9db6a42b503b8930dff. Required bytes are pinned in asr/manifests/en.json; the approved English bucket passed complete checks. asr/app.py follows the official Transformers pipeline, 16 kHz audio, torch 2.6 weights-only loading, remote code disabled.

Text: NCAIR1/N-ATLaS at e294476928aca9030e924ca27bb8e085e8581273. Its bfloat16 weights alone are roughly 16 GB and previous CPU requests exceeded 45/180 seconds. text_cpu verifies the official Safetensors/tokenizer manifest, converts with llama.cpp revision 631109b34da437a3c4a5ebd75091d677671392e3 and quantizes to Q4_K_M. The embedded official template is applied by the engine. Generated receipts record source hashes, output SHA256/size and recipe. Cache mismatches fail closed. Original weights and licence state are preserved; only verified conversion intermediates may be removed.

This conversion is quantization, not training or fine-tuning. No LoRA run, official API request or benchmark improvement over the unchanged base is claimed. The CPU candidate needs genuine relevance, adversarial, latency and memory checks. Do not describe authored engineering examples as human validation.

scripts/download-text-weights.mjs supports private approved access and bounded resumable downloads; all bytes must match the official manifest before conversion. Its Python alternative uses Hugging Face's official client. Credentials are loaded privately through environment files, never shell arguments. Conversion uses the pinned official source/runtime; no third-party quantized model is trusted.

scripts/prepare-secretvm.py generates full, english-pilot and english-complete profiles. The completion profile uses planned limits of 10 GB text, 3 GB English ASR and 256 MB gateway; these are limits, not measured peak consumption. It preserves text-models, asr-en-models, licence and Caddy volumes. Only gateway, text and asr-en should run. Do not delete volumes or create a replacement ledger. Keep the existing private HF_TOKEN, TEXT_SERVICE_TOKEN and ASR_SERVICE_TOKEN. The gateway handles HTTPS; no model port is publicly exposed directly.

After the actual CPU image passes checks, follow deployment/secretvm/ENGLISH-COMPLETE.md. Download/conversion is a startup phase, not a ready model. Authenticate /health; then run scripts/verify-model-host.mjs with --scope english-complete and real inference mode. Owner audio needs explicit consent and an actual recording. If tests fail, retain/restore the English pilot and TEXT_ENABLED=false. Bigger compute alone does not prove latency or quality.

## API contracts

GET /api/status returns pinned targets, configured flags, English scope and limitations. It does no inference. GET /api/learn returns eligible dated notices with server-side source/date/expiry checks. Configuration alone is not validation.

POST /api/asr requires matching Origin, Content-Type audio/wav, X-Audio-Consent: yes and X-Language: en. Canonical PCM16 mono 16 kHz audio must be 0.5-30 seconds, <=960,044 bytes. Success returns actual text, model/revision/language, confidence:null, latencyMs and random traceId. Missing consent or bad input is rejected; known paused languages return 503; sensitive output is discarded (422); overload/unavailable inference fails visibly. No transcript is invented.

POST /api/answer accepts a 1-600 character nonsensitive question, before/after/learn journey and English language. Privacy/source checks precede models; urgent response does not wait for one. If text is enabled, missing settings, failure, wrong identity or untrusted card output fail visibly. Success metadata identifies actual engine/model/revision and optional checked CPU runtime/quantization. Source-only answers have model:null. Response references are correlation identifiers, not signed research attestations.

SecretVM routes: /asr/en/transcribe, /asr/en/ready, authenticated /asr/en/health; completion adds /text/guide, /text/ready and authenticated /text/health. llama.cpp is fixed to loopback. These are team-host contracts, not proof of the official N-ATLaS API. lib/official-api.ts remains fail-closed.

## Source maintenance

lib/safety.ts records source URL/section, date, expiry, scenario basis and review status. Human safety review remains pending. lib/reporting.ts handles bank-first reporting and user-reported CBN escalation stages; it cannot determine eligibility automatically. Drafts preserve only the nonsensitive description and add no invented transaction facts. Latest direct CBN/ngCERT fetching returned 403; facts were checked against official-domain search-index content, not successful direct extraction.

lib/updates.ts contains three selected ngCERT notices dated 27 August, 13 July and 15 June 2026. The catalog expires 9 October unless actually rechecked. General source/escalation entries expire 1 November. Do not merely advance dates. Kayode coordinates safety review; Suleiman publishes reviewed changes with source evidence and tests. Withdraw uncertain/stale content and give a safe bank-contact fallback.

## Privacy and safety

Never request/store PINs, OTPs, passwords, account numbers or full credentials. Users must leave out names and private transaction details. Guards reject digits, email addresses, secret statements and digit-word sequences, but cannot detect every sensitive phrase. Listen/review before uploading. Screenshot input stays disabled.

Raw audio is not retained by default; text/audio are transient processing inputs. Mutable PCM is cleared where possible; immediate erasure of managed/runtime copies cannot be guaranteed. Inference access/prompt logs are disabled. Operators must check proxy/infrastructure logging independently; providers may process IP metadata. The active database stores licence timestamps, no user identifiers or bodies.

Protection includes origin checks, bounded streams, HTTPS-only endpoints, redirect refusal, exact identities, sensitive-output filtering and independent source/output allowlists. Non-root containers are read-only, resource-limited and capability-dropped. CPU web UI/slot monitoring/persistent prompt cache are disabled. Secrets are server-side and excluded from screenshots, exports and demo captures.

App limits are 90 answers and 30 ASR attempts per minute per Worker isolate, not global user quotas. Each model serializes work and rejects overload. Each inference reserves a timestamp in the shared conservative 950-request rolling ledger, including failures. Preserve it across restarts/upgrades. A hung CPU engine is terminated before new work is admitted and bounded container restart handles recovery. No automatic audio retry is performed.

## Research and evaluation

Ordinary questions create no research records. /evaluation consent defaults off. Its device-local whitelist retains measurements, optional helpfulness, prompted WER, checked model identities and returned request references, never question/transcript/audio or participant identifiers. Exported records are editable; they cannot independently prove human participation.

Use submission/03-validation/WEEKEND-TESTING.md and the empty observer CSV. Current final-round targets are English only and declared before data. At least 50 genuine completed voice interactions require consent, actual devices/networks, returned model evidence, corrections, comprehension, feedback and observer attestation. scripts/validate-research.py checks consistency and totals, not authenticity. No completed rows have been supplied. Raw logs remain private; reviewed aggregates only are published. Consent specifies deletion of individual logs within 90 days and withdrawal before aggregation.

## Accessibility, performance and operations

Semantic labels/headings, keyboard access, visible focus, touch targets, high contrast, reduced motion, system fonts and a text alternative are implemented. Earlier consumer checks passed 320/390-pixel overflow tests. Physical low-end Android, assistive technology and constrained-network testing remain pending. Real Web Vitals must state device/network/cache conditions; warm-browser measurements are limited observations. Report model latency separately from LCP/INP/CLS.

Monitor authenticated readiness, actual outcomes/latency, memory, disk, restarts and remaining licence/budget without body logs. A 502/503 is a failed check. Freeze a tested final-round build, record fixes and separate retests. Keep the inactive alternate host off. The supplied price is $0.24/hour ($5.76 per running day), excluding other charges; billing has not been independently reconciled. Existing budget: $150 total through 12 October; stop paid compute after review/testing. No new purchase is authorized here.

## Release limitations and attribution

Official PS2 requires the official ASR service and at least 50 documented real interactions. Organiser acceptance of self-hosted official weights is unresolved. Official API, fine-tuning and paused language capabilities cannot be claimed. Team facts need owner approval; CAC/ID remain private. A genuine 3-5 minute MP4 and human validation are pending. Nothing has been submitted to ONDI. Revenue and future impact are proposed, not traction.

Model licence: https://huggingface.co/NCAIR1/N-ATLaS

Challenge: https://ncair.nitda.gov.ng/naic/

Obtain separate licensing before exceeding 1,000 active users in a rolling 30 days. N-ATLaS is an initiative of the Federal Ministry of Communications, Innovation and Digital Economy, and powered by Awarri Technologies.
