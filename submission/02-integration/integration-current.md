# 02 - N-ATLaS integration evidence

PauseAm - Ask before you pay. Innovation & Enterprise / PS2. Review copy, 2 October 2026. Intended owner review/submission: Monday, 5 October. Not submitted.

## Current capability boundary

Amount/date and bank-help addendum: corrected/typed payment questions accept
ordinary amounts and dates; number values are omitted before the genuine model
relevance request. The active ASR continues to hide numbers. An independent
official-source directory answers email, phone and basic USSD-menu questions for
eight Nigerian banks without model inference (model=null). These contacts are
published bank facts, not model generation or official N-ATLaS API integration.
See ../evidence/bank-information-source-review-2026-10-03.md. Independent human
source review and participant testing remain pending; earlier PDFs are dated
copies and have not yet been regenerated for this update.

3 October update: Sites version 20 is live. The existing VM's authenticated ASR
health reports the pinned English model and numbers-redacted-v1 privacy policy;
the pinned llama.cpp text service is ready. Public authored questions with a
redacted amount returned exact reviewed supplier and reporting cards. A silent
WAV received the distinct 422 recording error without a transcript. Actual
timestamps, identities and latency are in ../evidence/freeform-voice-live-2026-10-03.json.
The owner confirms that the unscripted amount/date full voice journey works.
This is a self-reported check, not independent observation, speech accuracy
evidence or a completed participant interaction. The 2 October
PDF remains a dated review copy and does not include this addendum.

The agreed public language is Nigerian-accented English. The official English ASR returned a real owner transcript through the app; this is engineering evidence, not a completed participant-validation round. After the owner restored missing encrypted configuration, the correct same-model CPU service became ready. Six genuine authenticated HTTPS relevance requests passed in 6,141-6,754 ms, plus two pre-inference guards. Sites version 19 was redeployed with TEXT_ENABLED=true at 22:36:47 UTC on 2 October. Public model-backed supplier guidance was verified in the actual browser. These are engineering checks, not human validation.

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

Runtime release b11351 is pinned. Linux archive SHA256: c800a3402548d57f408adcebe4e53b939141e34e09b7e4701c785435572d1fee. Downloading files alone proves neither inference nor quality.

## Code locations

lib/asr.ts, app/api/asr/route.ts and asr/app.py enforce consent, bounded audio, exact official identity and sensitive-output refusal. lib/text-model.ts validates the selected card and optional CPU runtime identity. app/api/answer/route.ts keeps urgent source content immediate and fails visibly if enabled inference/configuration is unavailable.

text_cpu/bootstrap.py verifies original files and the conversion cache. text_cpu/contract.py creates finite schema-constrained generation; text_cpu/app.py authenticates, serializes and reserves real inference. Source retrieval chooses the strongest current card; N-ATLaS checks its relevance and may accept or abstain. Only that card ID or an empty selection is accepted. Unrelated/instruction-attack inputs are stopped before inference. Model-authored contacts, links and arbitrary safety prose never render. This is constrained relevance checking, not open-ended conversational generation.

scripts/prepare-secretvm.py generates digest-pinned profiles. scripts/verify-model-host.mjs checks real identities/requests. The old full-precision text_service and prior traces remain as historical evidence.

## Redacted production settings

ASR_ENABLED=true; ASR_ENDPOINT=https://amaranth-nightingale.vm.scrtlabs.com/asr/en/transcribe; KB_ENABLED=true; TEXT_ENABLED=true; TEXT_ENDPOINT=https://amaranth-nightingale.vm.scrtlabs.com/text/guide. ASR_SERVICE_TOKEN and TEXT_SERVICE_TOKEN are server-side secrets, excluded here. HF_TOKEN is private to model hosting/preparation. Deployment appgdep_6ac031f10d708191a2bb327e3af7dc14 applied environment revision 4.

Text is enabled only after genuine host identity, relevance, adversarial and latency checks, followed by a Sites deployment. Missing settings or failed inference cannot be passed off as model guidance.

## Genuine evidence and gaps

The earlier English owner transcript is documented in worker-redirect-fix-2026-10-02.json. The latest authenticated English health check returned HTTP 200 in 835 ms with the exact identity. Provenance/privacy/relevance changes passed 56 application tests and 27 Python checks. These are not participant interactions or speech-accuracy measurements.

Local conversion and successful requests remain in cpu-conversion-2026-10-02.json and cpu-local-relevance-check-2026-10-02.json. Earlier all-card/three-candidate failures remain unchanged. A schema-wrapper defect was caught and fixed before enablement. Retrieval followed by relevance checking passed; model-only classification of all cards did not.

Historical failures remain unchanged. Final container proof is cpu-final-container-2026-10-02.json; actual build: https://github.com/thepopeblack-byte/pauseam/actions/runs/37061753954. Its digest starts ed76b851; live readiness identifies llama.cpp and reviewed-card-relevance-v1. The VM-generated quantized SHA256 is 3820854be929790f10d171cd6f20dcd4e1ab3ccba095c133144a8dd10d65e49b; the separately generated Windows conversion has a different hash. Original source files are pinned in both recipes. Actual request trace: https://github.com/thepopeblack-byte/pauseam/blob/main/submission/evidence/live-text-inference-2026-10-02.json

Public results: live-text-public-check-2026-10-02.json. Of 21 public checks, 20 passed. The vague question "They want me to use different bank details" returned a safe no-match; the explicit supplier question worked. This unresolved comprehension limitation is retained. Five additional reporting/learning checks passed. The owner reports that the fresh complete English recording, transcript review and supplier guidance journey works; this is owner confirmation, not independently observed participant validation. Random response references are not signed proof of human participation: observed sessions require attestation.

## Official service and API findings

Version 24 adds source-derived situation explanations and clarifying questions;
the model's constrained card-selection contract and original source card remain
unchanged. It does not claim that authored explanations were generated by N-ATLaS.
Four genuine final public requests carried the pinned text-model identity and
returned eligible cards; see evidence/contextual-replies-live-v24-2026-10-03.json.
Vague payment queries request clarification without a payment assessment or claimed
model inference. No OpenAI voice key/API or automatic spoken replies are enabled;
the user's speech-provider decision remains pending. Existing PDFs precede this
addendum and need final regeneration/render review before submission.

PS2 requires the official N-ATLaS ASR service for the relevant language: https://ncair.nitda.gov.ng/naic/

Organiser acceptance of self-hosted official weights remains pending. Kayode authorized the prepared secretariat query, but no successful dispatch or reply is evidenced here. The official page lists API credentials among shortlisted-team support; no verified official endpoint/contract or successful official request is established. lib/official-api.ts fails closed. Official API and fine-tuning checkboxes remain unverified.

## Licence

The published cap is 1,000 active end users within a rolling 30 days; obtain separate licensing before exceeding it. This deployment uses a shared persistent ceiling of 950 inference reservations, including failures. Preserve its ledger across updates and keep alternate hosts inactive. Model terms: https://huggingface.co/NCAIR1/N-ATLaS

N-ATLaS is an initiative of the Federal Ministry of Communications, Innovation and Digital Economy, and powered by Awarri Technologies.
