# 05 — Video demonstration: incomplete

No submission MP4 exists. Current scope is English only. Capture after actual
live voice and CPU text checks pass. A slideshow or fake transcript is not evidence.

## Four-minute capture script
0:00–0:20: PauseAm / Ask before you pay; PS2, team and actual build.
0:20–1:30: real English voice question about supplier change; listen, upload, correct
the actual transcript, confirm, receive checklist. Show model/source metadata
from the actual response in a separate developer evidence view, outside the
consumer journey. Do not invent an in-product source-detail control.
1:30–2:05: urgent bank-contact action, private timeline and redacted summary.
2:05–2:25: warning-sign interaction.
2:25–3:25: actual English typed question and grounded guidance; show the genuine
CPU request trace and identity. State that Yoruba, Hausa and Igbo are paused.
3:25–3:50: genuine traces and validation totals; show official API and fine-tuning
only if successful. Otherwise explicitly state unverified/not performed.
3:50–4:00: limitations and evidence links.

## Capture and verify
Use a clean browser profile, no private notifications, and safe synthetic scenarios.
Obtain separate consent to publish any identifiable voice/video; research consent
alone is insufficient. Rehearsals do not count as user validation.
Use Win+G (Xbox Game Bar) or OBS, 1920x1080, 30fps and a real consenting narrator.
Never show secret settings. Do not replace actual model output with edited text.
Review every frame for secrets/IDs and re-record unsafe scenes.
Write SRT captions from actual speech and fluent-reviewed translations.

Encode:
ffmpeg -i pauseam-capture.mp4 -vf "subtitles=pauseam-captions.srt" -c:v libx264 -crf 22 -preset medium -c:a aac -b:a 128k -movflags +faststart pauseam-demo.mp4

Verify:
ffprobe -v error -show_entries format=duration:stream=codec_name,codec_type -of json pauseam-demo.mp4

Require 180–300 seconds, readable captions, audible speech and smooth playback.
Watch the entire final file with sound. Hash it, record consent and build, then
publish an evaluator-accessible URL after Kayode reviews it. No video was uploaded.
