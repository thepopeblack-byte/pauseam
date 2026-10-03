# N-ATLaS integration

PauseAm | Ask before you pay. | Innovation & Enterprise | PS2: Voice-First Access

## Integration overview
PauseAm uses official NCAIR models for English speech recognition and source-grounded payment guidance. Users record a question, review and correct the transcript, then receive practical next steps. The frontend is hosted on Sites at https://pauseam.theblockcapitol.com. The team's authenticated model services run on SecretVM at https://amaranth-nightingale.vm.scrtlabs.com.

## Models and deployment
English ASR: NCAIR1/NigerianAccentedEnglish, revision 3c52c6e6c9ec508014a7b9db6a42b503b8930dff. The service follows the published Transformers pipeline with 16 kHz mono audio. Required files are checked against asr/manifests/en.json and the official revision before loading.

Text: NCAIR1/N-ATLaS, revision e294476928aca9030e924ca27bb8e085e8581273. The official weights are verified, converted with llama.cpp revision 631109b34da437a3c4a5ebd75091d677671392e3, and quantized to Q4_K_M for the 16 GB CPU host. The embedded model chat template and a constrained output schema are used. The deployed conversion SHA256 is 3820854be929790f10d171cd6f20dcd4e1ab3ccba095c133144a8dd10d65e49b. This is inference with quantized official weights, not fine-tuning.

The current deployment supports Nigerian-accented English. Browser/device speech reads voice-mode replies, with text, replay and stop controls. Typed replies remain silent. The video's separately labelled Microsoft Nigerian-English narration is postproduction audio.

## End-to-end flow
1. The user chooses Speak and consents to audio processing.
2. The browser records a short question and converts it to bounded PCM16 mono 16 kHz WAV.
3. A same-origin server route validates the recording and forwards it to the authenticated English ASR service.
4. The returned model identity and transcript privacy policy are checked. The user corrects and confirms the transcript.
5. Retrieval chooses a current reviewed payment-safety card. N-ATLaS evaluates its relevance and returns the eligible card ID or abstains.
6. Independent validation resolves the selected ID to the reviewed checklist. Situation-specific wording gives the next action; voice mode reads it aloud.

Urgent reporting actions and published bank contacts use maintained source content directly. These responses are labelled source-only in backend metadata. Model output cannot introduce new phone numbers, source URLs or unsupported payment verdicts.

## Implementation
lib/asr.ts and app/api/asr/route.ts implement the browser-to-server contract; asr/app.py runs the official ASR pipeline. lib/text-model.ts and app/api/answer/route.ts connect the relevance service. text_cpu/bootstrap.py verifies model files and conversion receipts; text_cpu/contract.py constrains generation; text_cpu/app.py authenticates requests and serializes inference. lib/safety.ts maintains guidance provenance; lib/guidance.ts applies situation-specific explanations.

Production settings: ASR_ENABLED=true, KB_ENABLED=true, TEXT_ENABLED=true. ASR_ENDPOINT is https://amaranth-nightingale.vm.scrtlabs.com/asr/en/transcribe. TEXT_ENDPOINT is https://amaranth-nightingale.vm.scrtlabs.com/text/guide. Service tokens are configured as server-side secrets.

## Engineering verification
Version 25 passed 80 application tests, type checking, the production build and ten public backend checks. Four of those backend checks returned the pinned N-ATLaS text-model identity, request references and relevant guidance. Recorded request timings were 5,960-7,803 ms. The six authenticated text-host requests on 2 October completed in 6,141-6,754 ms; two input guards returned without inference.

Health, real requests, model identity, input guards and timings can be reproduced with scripts/verify-model-host.mjs. The engineering results and operating-product screenshots are linked below. Participant feedback is documented separately in the validation report.

Request traces: https://github.com/thepopeblack-byte/pauseam/blob/main/submission/evidence/spoken-replies-live-2026-10-03.json

Authenticated model-host requests: https://github.com/thepopeblack-byte/pauseam/blob/main/submission/evidence/live-text-inference-2026-10-02.json

ASR checks: https://github.com/thepopeblack-byte/pauseam/blob/main/submission/evidence/freeform-voice-live-2026-10-03.json

Verification script: https://github.com/thepopeblack-byte/pauseam/blob/main/scripts/verify-model-host.mjs

Source repository: https://github.com/thepopeblack-byte/pauseam

## Access and licence
Access is through approved model weights on the team's inference host. These endpoints are team-hosted services; an official N-ATLaS API endpoint has not been established. We are seeking organiser confirmation that hosting the published ASR weights satisfies the PS2 service requirement.

The model licence allows up to 1,000 active end users within a rolling 30-day period. A persistent shared 950-reservation guard conservatively limits pilot inference. Separate licensing is required before exceeding the published cap or starting commercial model use.

Model terms: https://huggingface.co/NCAIR1/N-ATLaS

English ASR: https://huggingface.co/NCAIR1/NigerianAccentedEnglish

Challenge: https://ncair.nitda.gov.ng/naic/
