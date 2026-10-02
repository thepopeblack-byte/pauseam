# 02 - N-ATLaS integration evidence

PauseAm - Ask before you pay. Innovation & Enterprise / PS2. Review copy, 2 October 2026. Intended owner review/submission: Monday, 5 October. Not submitted.

## Current capability boundary

The agreed public language is Nigerian-accented English. The official English ASR returned a real owner transcript through the app; this is engineering evidence, not a completed participant-validation round. Text inference is currently disabled after genuine failures/timeouts. A new same-model CPU service is implemented and undergoing actual image/inference checks. Preparation is not a successful text request.

Yoruba, Hausa and Igbo adapters and byte-verified model files remain available but are paused. Official API access and fine-tuning are not demonstrated. Quantization is a precision conversion, not fine-tuning. Do not select unsupported capabilities or languages on the portal.

## Actual architecture

Consent -> English recording -> bounded mono 16 kHz WAV -> Sites Worker -> authenticated SecretVM ASR -> identity/privacy checks -> transcript correction/confirmation -> current source cards -> optional N-ATLaS card selection -> independently validated checklist.

Urgent bank-first actions do not wait for a model. Reports are reviewed drafts, not automatically sent complaints. No funds are moved, accounts authenticated, safe verdicts issued or recovery promised.

Public app: https://pauseam.theblockcapitol.com

Public source: https://github.com/thepopeblack-byte/pauseam

Team inference: https://amaranth-nightingale.vm.scrtlabs.com

## Model identities and recipe

English ASR: NCAIR1/NigerianAccentedEnglish at 3c52c6e6c9ec508014a7b9db6a42b503b8930dff. Its separate approved bucket is Blockcapitol/NigerianAccentedEnglish-bucket; every required file was checked against that official revision. See asr/manifests/en.json and submission/evidence/asr-bucket-en-2026-10-02.json.

Text: NCAIR1/N-ATLaS at e294476928aca9030e924ca27bb8e085e8581273. The new CPU path verifies original Safetensors/tokenizer bytes against text_service/model-manifest.json, converts with official llama.cpp revision 631109b34da437a3c4a5ebd75091d677671392e3 and quantizes to Q4_K_M. The embedded official chat template is used. The generated provenance receipt records original hashes, output hash/size and recipe. No alternative model is substituted.

Runtime release b11351 is pinned. Linux archive SHA256: c800a3402548d57f408adcebe4e53b939141e34e09b7e4701c785435572d1fee. Windows archive SHA256: ced25d91ed2c0981420dcfc9e7823892156c13b5c8dc9f26d334d8e3e4c33a09. Conversion/quality/latency are not assumed from downloading these files.

## Code locations

lib/asr.ts, app/api/asr/route.ts and asr/app.py enforce consent, bounded audio, exact official identity and sensitive-output refusal. lib/text-model.ts validates the selected card and optional CPU runtime identity. app/api/answer/route.ts keeps urgent source content immediate and fails visibly if enabled inference/configuration is unavailable.

text_cpu/bootstrap.py verifies original files and the conversion cache. text_cpu/contract.py creates finite schema-constrained generation; text_cpu/app.py authenticates, serializes and reserves real inference. Only zero or one reviewed card ID is accepted. Model-authored contacts, links and arbitrary safety prose never render. This demonstrates constrained understanding/selection if its actual requests pass; it does not claim open-ended conversational generation.

scripts/prepare-secretvm.py generates digest-pinned profiles. scripts/verify-model-host.mjs checks real identities/requests. The old full-precision text_service and prior traces remain as historical evidence.

## Redacted production settings

ASR_ENABLED=true; ASR_ENDPOINT=https://amaranth-nightingale.vm.scrtlabs.com/asr/en/transcribe; KB_ENABLED=true; TEXT_ENABLED=false at this checkpoint; TEXT_ENDPOINT=https://amaranth-nightingale.vm.scrtlabs.com/text/guide. ASR_SERVICE_TOKEN and TEXT_SERVICE_TOKEN are server-side secrets, excluded here. HF_TOKEN is private to model hosting/preparation.

Text is enabled only after genuine host identity, relevance, adversarial and latency checks, followed by a Sites deployment. Missing settings or failed inference cannot be passed off as model guidance.

## Genuine evidence and gaps

The English owner transcript and redirect investigation are documented in worker-redirect-fix-2026-10-02.json and english-pilot-2026-10-02.json. This turn's English authenticated health check returned HTTP 200 in 809 ms with the exact identity; no new audio was uploaded. New provenance/privacy changes passed 55 application tests and 27 Python checks. These are engineering checks, not participant interactions or ASR accuracy measurements.

Historical text requests failed the contract or exceeded 45/180 seconds. Their original traces remain unchanged. The CPU image built, passed offline imports/binary checks and its exact digest passed anonymous pull: submission/evidence/cpu-container-2026-10-02.json. Build run: https://github.com/thepopeblack-byte/pauseam/actions/runs/37055859513. This is not inference. Attach conversion receipts, actual request outcomes/timing and screenshots only after they exist. Random response references are not signed proof that a human participated. Human sessions need observer attestation.

## Official service and API findings

PS2 requires the official N-ATLaS ASR service for the relevant language: https://ncair.nitda.gov.ng/naic/

Organiser acceptance of self-hosted official weights remains pending. Kayode authorized the prepared secretariat query, but no successful dispatch or reply is evidenced here. The official page lists API credentials among shortlisted-team support; no verified official endpoint/contract or successful official request is established. lib/official-api.ts fails closed. Official API and fine-tuning checkboxes remain unverified.

## Licence

The published cap is 1,000 active end users within a rolling 30 days; obtain separate licensing before exceeding it. This deployment uses a shared persistent ceiling of 950 inference reservations, including failures. Preserve its ledger across updates and keep alternate hosts inactive. Model terms: https://huggingface.co/NCAIR1/N-ATLaS

N-ATLaS is an initiative of the Federal Ministry of Communications, Innovation and Digital Economy, and powered by Awarri Technologies.
