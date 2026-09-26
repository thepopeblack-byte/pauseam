# Five-minute honest demo

1. Open the safety check on a phone-sized screen. Explain: “This is a Nigerian payment-safety research MVP, not a bank. It never needs banking secrets.”
2. Show the three journeys. Under Before I pay, choose Suspicious link and submit. Show the CBN source, review date, automated-review caveat and answer model: none. Explain that N-ATLaS does speech recognition; reviewed retrieval supplies the advice.
3. Choose I’ve already paid. Show immediate bank-contact guidance without waiting for ASR. Submit the suspected-fraud topic. Explain that the app neither files reports nor promises recovery.
4. Choose Help me learn, submit the banking-code topic and answer the practice question. Optionally read the public guidance aloud. Disclose that this is browser speech synthesis, not N-ATLaS TTS.
5. Ask an out-of-scope question such as “What is the weather?” Show the refusal to invent an answer.
6. Open Evaluation: zero records and “Not measured” are the correct state before real testing. Explain separate voluntary testing and audio-processing consent, local retention, no participant IDs, export and deletion.

## With genuine approved model access

7. On Evaluation, choose a fixed safe prompt, opt in, then consent to audio processing. Record yourself reading it exactly. Stop and listen. If anything private was spoken, discard it. Otherwise choose Transcribe this recording.
8. Show the actual NCAIR transcript and refreshed counts/WER. Explain one sample is not validation and imperfect delivery of the reference changes the metric.
9. In a journey, record a safe scenario, inspect/correct the actual transcript and explicitly confirm it before retrieving guidance.
10. Save an optional useful/not-useful rating, export only if desired, and demonstrate deletion of your own test records.

## Without model access

State plainly: “The NCAIR integration is implemented but live inference is not configured or validated. We are showing the safe fallback.” Do not play fabricated output, prefill a transcript or report a WER. The typed workflow is still demonstrable.

## Submission evidence checklist

Attach exact code revision and model SHA, setup instructions, source-review register, observed test output, screenshots and genuinely collected consented trial exports if any. Label software test fixtures separately from model/participant evidence. Record actual reviewer approval and actual field results only when obtained.

