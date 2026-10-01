# 02 — N-ATLaS integration evidence

PauseAm | Ask before you pay.
Status: BLOCKED for qualifying PS2 submission. Actual code and metadata are
documented here; no successful inference is claimed.

## Architecture
Browser consent and microphone → WAV conversion → same-origin /api/asr →
configured HTTPS ASR host → pinned official model → identity validation →
editable transcript → explicit confirmation → /api/answer → current source library.

When enabled, the pinned N-ATLaS text service selects one source card or abstains.
The browser renders source-linked wording, never model-supplied links, contacts or
free-form instructions. Urgent bank-contact actions do not wait for a model.

## Code evidence
lib/models.ts records official identities and immutable revisions.
lib/asr.ts and app/api/asr/route.ts enforce consent, audio bounds and provenance.
components/voice-input.tsx handles consent, recording, playback, upload and cancellation.
components/journey.tsx requires transcript correction/confirmation.
asr/app.py uses the documented official Transformers pipeline.
text_service/app.py uses AutoTokenizer, AutoModelForCausalLM and apply_chat_template.
lib/text-model.ts validates constrained card selection.
lib/official-api.ts fails closed until the legitimate contract is supplied.

## Redacted configuration
ASR_ENABLED=false, TEXT_ENABLED=false, KB_ENABLED=true.
ASR_ENDPOINT, ASR_YO_ENDPOINT, ASR_HA_ENDPOINT, ASR_IG_ENDPOINT and TEXT_ENDPOINT
remain empty until real HTTPS services exist. Tokens belong only in host secret
settings. HF_TOKEN belongs only on model hosts. MODEL_LANGUAGE and MODEL_REVISION
explicitly select the official weights. No credentials appear in this document.

## Genuine request evidence
Public Hugging Face metadata returned the five pinned revisions and file lists.
An unauthenticated gated Yoruba configuration request returned HTTP 401.
Local HTTP checks exercised retrieval and unavailable inference; they did not
perform speech recognition. There are no successful model traces or language
screenshots yet. Test fixtures never count as model validation.

After actual consented calls, capture only timestamp, build, language, model/revision,
request ID, response status, duration, bytes and identity-check result. Do not log
audio, text, secrets or full headers. Separately consent to a non-sensitive scripted
example for screenshots; never invent a transcript to fill the evidence gap.

## Claim decisions
All four ASR adapters: implemented, live inference unverified.
N-ATLaS text adapter: implemented, inference unverified.
Official API: no documented contract or successful request.
Fine-tuning: no training run or held-out comparison.
No capability checkbox is justified by the current evidence.
Organiser confirmation of the official-ASR-service requirement is pending.
See the following access register for exact versions, licence and compute findings.
