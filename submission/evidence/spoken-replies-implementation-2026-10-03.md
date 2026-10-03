# Spoken replies: implementation and resource findings

Resource review: 3 October 2026. This is engineering evidence, not participant validation.

The official [NCAIR model inventory](https://huggingface.co/NCAIR1) lists five
models: four ASR models and N-ATLaS text. The [published N-ATLaS model card and
licence](https://huggingface.co/NCAIR1/N-ATLaS/blob/main/README.md?code=true)
describe the same scope. No documented official text-to-speech weights or speech
generation API were found in these resources. This finding does not establish
that no private or future service exists. No guessed endpoint or community TTS
Space is represented as official N-ATLaS TTS.

The current English pilot retains the genuine pinned NCAIR ASR and text-model
integration. For supported payment scenarios N-ATLaS selects reviewed guidance;
authored scenario explanations supply the final wording. Bank facts and urgent
bank-first actions retain their existing direct source path. Device speech reads
this answer; it does not generate financial advice. No OpenAI model/API is used.

## User flow

- Speak: audio consent → record → listen/discard → transcribe with official ASR
  → correct and confirm transcript → send question → automatically attempt a
  spoken reply, with its text below and Replay reply / Stop controls.
- Type: enter question → send → text answer, without automatic or hidden speech.
- The voice preference survives correction and a staged follow-up. Choosing Type
  makes the next answer silent. Editing, recording again, changing input mode,
  changing the report stage, leaving the journey or hiding the page stops playback.
- A missing local English voice, playback error or blocked autoplay gives a
  visible fallback. The full text remains usable and replay is user initiated.

## Implementation and privacy

`components/spoken-reply.tsx` uses the browser SpeechSynthesis API and a local
English device voice (`localService`), preferring en-NG if available. It does not
claim a Nigerian accent when another local English voice is selected. Browser
support and installed device voices determine availability and quality. No audio
reply file is generated, uploaded, stored or downloadable. No additional model
server, secret or VM deployment is needed for readout.

`lib/spoken-answer.ts` reads the displayed heading, summary, main actions and
clarification; collapsed optional detail is excluded. Public bank phone digits
are spoken individually and USSD symbols as star/hash. It never receives the raw
question, transcript or private report draft. `lib/reporting.ts` supplies a shared
step list to the display and speech so changing complaint stage cannot play a
different plan. `lib/speech-playback.ts` bounds utterance chunks, cancels queued
speech and fences late callbacks. Its startup timeout covers unavailable autoplay.

Nine dedicated tests exercise content alignment, combined bank contacts,
reporting stage changes, unavailable answers, chunking, replay races, stop,
disposal, timeout and engine exceptions. These use explicitly mocked speech
events; they are not proof of audible output, ASR accuracy or tester interactions.
Final release evidence records actual build/browser checks and remaining physical
device work separately.

## Submission claims

Claim: N-ATLaS English ASR and text integration with device read-aloud replies.
Do not claim N-ATLaS TTS, OpenAI voice, official N-ATLaS API access or a completed
four-language spoken journey. Official ASR service eligibility is still awaiting
an organiser ruling. Human speech playback and screen-reader checks on intended
Android devices are required before marking representative usability passed.
