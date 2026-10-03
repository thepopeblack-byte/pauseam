# 05 — Video demonstration: incomplete

No submission MP4 exists. Current scope is English only. Actual English voice
and CPU text engineering/owner checks pass on live version 25. The current
browser-control environment exposes screenshots and form interaction, but no
screen-and-microphone video recording capability; native apps are unavailable.
Encoding tools are installed, so a real owner capture can be captioned and
rendered here after it is provided. A slideshow or fake transcript is not
evidence; reproduce the actual model behaviour during capture.

## Four-minute capture script
0:00–0:20: open https://pauseam.theblockcapitol.com. Say: "PauseAm: Ask before
you pay. Our PS2 prototype helps Nigerians check a payment request, report a
money problem and learn warning signs. This build supports English voice and text."

0:20–1:35: choose Speak, read the audio consent and consent if comfortable.
Record in your own voice: "A supplier sent new bank details and wants me to pay
today. What should I check before sending the money?" This is an authored demo
scenario, not participant validation. Stop and listen. Transcribe, show the real
returned text, correct only actual errors and explicitly confirm before sending.
Wait for actual inference. Let the device-read response play; demonstrate Stop
and Replay. Say: "Official NCAIR English ASR produces the transcript. The pinned
N-ATLaS text model checks relevance against reviewed guidance. Reply audio is
local device readout, not a claimed N-ATLaS TTS service."

1:35–2:20: choose Report a problem and enter the made-up description: "I paid
after a message that claimed to be from a supplier. The supplier says they did
not receive it." Show the actual bank-first actions, complaint-stage choices,
report preview and download. Say: "Contact your bank through a verified channel.
The report is a draft for your review and sending. PauseAm does not move money,
send a complaint automatically or promise recovery." Do not fill real details.

2:20–2:55: choose Learn and ask by text: "What is GTBank's customer care number
and email?" Show the actual combined answer and official source. Say: "Bank
contacts come from reviewed official bank pages, not invented model contacts."
Then show one current warning-sign lesson if time permits; do not call it a live
news feed.

2:55–3:25: choose Type and ask: "A supplier sent new bank details and wants
payment today. What should I do?" Show the real guidance and silent text path.
Do not dub a voice response over a typed answer as if the product spoke it.

3:25–3:50: open the public integration evidence and current real request traces.
Show actual model IDs/revisions and deployment diagram. State that other
languages are paused, official API/fine-tuning are not demonstrated, and the
self-hosted-ASR qualification is awaiting organiser confirmation. Show validation
totals only after observer records are genuinely reconciled; otherwise say that
testing is under way and no completed documented count is available yet.

3:50–4:00: show the repository and app URLs. Say: "Our current limitations and
source provenance are documented. We are reviewing real tester findings before
final submission." Adjust that sentence only when the evidence changes.

## Capture and verify
Use a clean browser profile, no private notifications, and safe synthetic scenarios.
Obtain separate consent to publish any identifiable voice/video; research consent
alone is insufficient. Rehearsals do not count as user validation.
Use Win+G (Xbox Game Bar) or OBS, 1920x1080, 30fps and a real consenting narrator.
Record microphone plus desktop audio so the input narration and spoken reply
are both audible. Play a short test recording first to check both tracks.
If model latency exceeds the scheduled segment, keep the actual wait or disclose
any cut; do not fabricate a response or use an old answer as a new result.
Never show secret settings. Do not replace actual model output with edited text.
Review every frame for secrets/IDs and re-record unsafe scenes.
Write SRT captions from actual speech and fluent-reviewed translations.

Encode:
ffmpeg -i pauseam-capture.mp4 -vf "subtitles=pauseam-captions.srt" -c:v libx264 -crf 22 -preset medium -c:a aac -b:a 128k -movflags +faststart pauseam-demo.mp4

Verify:
ffprobe -v error -show_entries format=duration:stream=codec_name,codec_type -of json pauseam-demo.mp4

Require 180–300 seconds, readable captions, audible speech and smooth playback.
Watch the entire final file with sound. Hash it, record consent and build, then
publish an evaluator-accessible URL after Kayode reviews it. Test the URL while
signed out, then paste that real URL into ONDI's video field. Its absence currently
prevents access to Programme Fit. No video was created or uploaded by this plan.
