# 02 — N-ATLaS integration evidence

PauseAm | Ask before you pay.
Status: BLOCKED for qualifying PS2 submission. Actual code and metadata are
documented here. Actual text loading succeeded, but no guidance inference has
passed the response contract. Four-language voice remains blocked.

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
remain unset in the public app until their genuine end-to-end checks pass.
The text host exists at https://copper-squirrel.vm.scrtlabs.com/text/guide;
its first guidance response failed the contract. Tokens belong only in host secret
settings. HF_TOKEN belongs only on model hosts. MODEL_LANGUAGE and MODEL_REVISION
explicitly select the official weights. No credentials appear in this document.

## Genuine request evidence
Public Hugging Face metadata returned the five pinned revisions and file lists.
Anonymous configuration probes for all four pinned ASR models returned HTTP 401
on 2 October. Later authenticated probes returned HTTP 403 for all four; the
provider reported that the token's account was not authorized for these models.
Local HTTP checks exercised retrieval and unavailable inference; they did not
perform speech recognition. The authenticated text-host health check returned
HTTP 200 with the exact model revision, verified-bucket provenance and bfloat16
dtype. This confirms genuine weight loading. The first actual guidance request
returned HTTP 422 after 30,453 ms: generated output failed the strict contract.
The non-sensitive engineering input is synthetic; model execution and its failure
are real. No participant interaction or successful guidance is inferred from it.
See submission/evidence/text-inference-first-attempt-2026-10-02.json and
submission/evidence/asr-access-2026-10-02.json and
submission/evidence/asr-authenticated-access-2026-10-02.json. The parser update passed 16 unit
tests and built in run 36956992856; the provider subsequently reported an update
error. Recovery and live retest remain necessary. No language screenshots exist.

After actual consented calls, capture only timestamp, build, language, model/revision,
request ID, response status, duration, bytes and identity-check result. Do not log
audio, text, secrets or full headers. Separately consent to a non-sensitive scripted
example for screenshots; never invent a transcript to fill the evidence gap.

## Claim decisions
All four ASR adapters: implemented, live inference unverified.
N-ATLaS text adapter: genuine weights loaded; actual request failed safely; live guidance not passed.
Official API: no documented contract or successful request.
Fine-tuning: no training run or held-out comparison.
No capability checkbox is justified by the current evidence.
Organiser confirmation of the official-ASR-service requirement is pending.
See the following access register for exact versions, licence and compute findings.

## Historical SecretVM handoff

The updated bucket root fully matches the official Igbo model's 13 required files,
including the entire binary weight. The other three ASR weights do not match;
text configuration files have been overwritten by ASR files. Five isolated folders
are required for reproducible deployment. These byte checks are not speech output.
The final images built successfully in run 36959714636 from source 836fe48; their
actual digests and anonymous access are recorded in model-container-build-2026-10-02.json.
The decoder now constrains actual model token choices to one trusted card or
abstention, then independently validates JSON. Eighteen Python checks passed.
Final-image runtime inference remains unverified until deployment and real tests.
See deployment/secretvm/README.md, pauseam-compose.yml and scripts/verify-model-host.mjs.

## Current CPU hosting preparation

The four new separate ASR buckets were streamed in full. All required files
match pinned official revisions: English 13, Yoruba 12, Hausa 13, Igbo 13,
including each entire weight. Reports: submission/evidence/asr-bucket-en,
yo, ha, ig-2026-10-02.json. These 51 file checks prove provenance, not recognition.
The mixed text root still fails its small-file audit; CPU hosting therefore
loads the approved official text repository at its pinned revision.

https://pauseam.theblockcapitol.com has active HTTPS. Fifteen public baseline
checks passed; the model gate failed because no inference host is connected.
The selected Hugging Face CPU package is in deployment/huggingface-space,
with a code-only ZIP in output/huggingface-space. Its protected gateway exposes
five loopback services and reserves usage through a timestamp-only Sites D1
ledger before every inference. Account billing, private configuration, actual
launch, RAM and latency tests remain pending. No Space, official API request,
successful new guidance or speech output is claimed by this preparation.
