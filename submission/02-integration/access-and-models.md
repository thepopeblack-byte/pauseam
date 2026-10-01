# PauseAm — model access findings

Checked 1 October 2026. No successful inference requests have been recorded.
Public model cards and file metadata were read. Gated configuration/weight files
could not be read: a direct official Yoruba config request returned HTTP 401.
No Hugging Face token or cached login is present in this workspace. File-list
inspection is not weight inspection and is not proof of model integration.

## Official repositories and pinned versions

- Text: https://huggingface.co/NCAIR1/N-ATLaS — e294476928aca9030e924ca27bb8e085e8581273
- English: https://huggingface.co/NCAIR1/NigerianAccentedEnglish — 3c52c6e6c9ec508014a7b9db6a42b503b8930dff
- Yoruba: https://huggingface.co/NCAIR1/Yoruba-ASR — d1ae7b8b79c2ccd547d8761effe5057433f3fc7f
- Hausa: https://huggingface.co/NCAIR1/Hausa-ASR — e635b9eda29060c6114c8f4d8b2d903f5c83a44a
- Igbo: https://huggingface.co/NCAIR1/Igbo-ASR — 180732299d5cba3dc8b289260ac84b7838bb3954

All five metadata records report automatic gating. Account holders must accept
publisher conditions. The four ASR cards document a Transformers speech-recognition
pipeline with 16 kHz audio. The text card documents AutoTokenizer,
AutoModelForCausalLM and apply_chat_template. Our services follow those entry
points, add pinned revisions and reject identity mismatches.

ASR file lists contain pytorch_model.bin, not Safetensors. The previous server
incorrectly required Safetensors; it now uses PyTorch weights-only loading with
torch 2.6.0 and remote code disabled. This change has not yet been exercised against
downloaded weights. Text files list four Safetensors shards. No optimiser or
training-state pickle files are needed or loaded by the inference services.

## Service versus weights versus official API

The NAIC PS2 rule explicitly calls for the official N-ATLaS ASR service:
https://ncair.nitda.gov.ng/naic/
The page lists API credentials as shortlisted-team support. No verified official
service URL or API contract was found in the inspected official pages.
Self-hosted official weights may or may not satisfy PS2; organiser confirmation
is pending. The prepared organiser query has not been sent.

The web adapters point only at explicitly configured HTTPS hosts. Such a host
would be a team-operated inference service, not proof of official API use.
lib/official-api.ts always fails closed until a documented contract is available.

## Capability claim register

- English ASR: adapter implemented; live result unverified.
- Yoruba ASR: adapter implemented; live result and fluent review unverified.
- Hausa ASR: adapter implemented; live result and fluent review unverified.
- Igbo ASR: adapter implemented; live result and fluent review unverified.
- Text N-ATLaS: constrained card-selection adapter and service implemented; inference unverified.
- Official API: no successful request; do not check this capability.
- Fine-tuning: not performed; do not check this capability.
- End-to-end four-language guidance: blocked; English interface/source wording only.

## Resources actually inspected

Windows host: 8 logical processors; approximately 31.8 GiB RAM, 7.9 GiB free at
inspection; NVIDIA Quadro P520 with 4,096 MiB VRAM. Docker CLI is installed but its
Linux engine was not running. Node dependencies are installed. The bundled Python,
GitHub CLI, FFmpeg and Poppler are available. GitHub CLI identifies thepopeblack-byte.
No paid compute has been provisioned or purchased.

Four ASR models may be run on separate small hosts or sequentially on suitable
compute after measurement. The text model needs substantially more memory than
available GPU capacity; no local full-model training claim is plausible. Choose
a host based on measured load, not an invented cost/performance number.

## Licence and attribution

Each model card publishes terms with a cap of 1,000 active end users in a rolling
30-day period. Separate commercial licensing is required before exceeding it,
through Awarri Technologies in partnership with FMCIDE. Contact details appear
in the official model cards: datasupport@awarri.com and ncair@nitda.gov.ng.
Obtain a written licence decision before scaling; do not assume a software licence
for this repository grants model rights. Required model attribution:

“N-ATLaS is an initiative of the Federal Ministry of Communications, Innovation
and Digital Economy, and powered by Awarri Technologies.”

No model is renamed by PauseAm. Keep model attribution with all public use.
Before enabling public inference, implement and verify cross-host rolling user
accounting or restrict the pilot to a tracked roster below the cap. A browser
cookie is not reliable person counting. Rate limits alone do not enforce this cap.
Current public inference remains disabled; the proposed pilot pool is 200+,
not an approved unlimited model audience.
