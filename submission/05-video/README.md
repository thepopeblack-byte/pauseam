# PauseAm video demonstration

The real owner-supplied mobile recording has been edited into a **4:43**
(282.5 seconds) landscape demo. No application transcript, question or answer
was created or replaced for this edit. Selected takes retain normal playback
speed; idle and repeated sections were trimmed. The closing actual result frame
is held for 18 seconds. Captions and explanatory chapter panels were added.

## Video files

- Video: `output/video/pauseam-demo-review.mp4`
- Captions: `output/video/pauseam-demo-captions.srt`
- Poster: `output/video/pauseam-demo-poster.jpg`
- Render receipt: `output/video/pauseam-demo-edit-receipt.json`

These paths are relative to the repository checkout. Generated media
stays local and is excluded from Git. The original recording in Downloads was
not changed. The [edit plan](edit-plan.json),
[render script](../../scripts/edit-demo-video.py) and
[actual checks](../evidence/demo-video-edit-2026-10-03.json) are versioned.

## Voice provenance and evidence boundaries

The user approved separate Nigerian-accent TTS because no verified N-ATLaS
speech generator was identified in NCAIR's published resources. The narrator
is **Microsoft en-NG-AbeoNeural**, using edge-tts 7.2.8 at -8% rate.
[Microsoft lists this voice as Nigerian English](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support).
The client is [edge-tts](https://github.com/rany2/edge-tts).
Every chapter's footer labels it as separate narration, not N-ATLaS TTS.
Only the authored nonsensitive narration text was sent for speech generation;
the owner's recording was processed locally.

All original audio was removed. The recording has a mixed audio track, so this
also removes captured app speech. The replacement narration is postproduction
commentary and **does not prove the app's audible reply**. App output and controls
remain visible in the real footage. Existing separate engineering and owner
checks document the app readout. This edit adds no participant validation count.
English only is demonstrated; official API, fine-tuning and other languages
are not claimed. The organiser's self-hosted ASR-service qualification is pending.

## Checks performed

- Full FFmpeg decode: exit 0, no decode errors.
- FFprobe: H.264/yuv420p, 1920×1080, 30 fps; AAC mono, 48 kHz.
- Duration: 282.5 seconds, within the required 3–5 minutes.
- 45 caption cues, no overlapping intervals.
- Audio-level check: mean -18.5 dB, peak -1.4 dB; no clipping indicated.
- 28 frames sampled every 10 seconds from 5 to 275 seconds were inspected
  as contact sheets; a full-size frame at 58 seconds was also inspected.
- Muted intermediate has no audio track; final audio maps only generated
  narration. The source hash is unchanged.

These are technical and sampled visual checks, not human full playback or a
certification that every frame is free of private information. Before release,
Kayode must watch the entire file with sound, check Nigerian pronunciation,
caption readability and sequence, and confirm permission to publish the shown
recording. Keep the actual recognition corrections and edit disclosure visible.
If another recording is needed to demonstrate audible product speech, capture
microphone and app audio as separate tracks.

Video URL supplied in ONDI: https://youtu.be/Q-CDzLg24J0

On 3 October, a fresh browser check encountered Google's traffic-verification
page. Check this exact URL while signed out in a normal browser before submitting.

## Reproduce the edit

On Windows, install FFmpeg/FFprobe on PATH, Python with `numpy` and `Pillow`,
and the Segoe UI fonts. From the repository root, create the isolated TTS client:

```powershell
python -m venv private/video-edit/edge-venv
private/video-edit/edge-venv/Scripts/python.exe -m pip install edge-tts==7.2.8
python scripts/edit-demo-video.py --stage narrate
python scripts/edit-demo-video.py --stage render --source "C:/Users/Popeblack/Downloads/Video/Screen_Recording_20261003_093130_Chrome.mp4"
ffprobe -v error -show_format -show_streams -of json output/video/pauseam-demo-review.mp4
ffmpeg -hide_banner -v error -i output/video/pauseam-demo-review.mp4 -f null -
```

Speech generation requires access to Microsoft's online service. It does not
use the N-ATLaS inference host or need a token. The script caches narration and
scene renders under `private/video-edit`; a re-render reuses these files. If
changing the narration or chapter design, use a fresh work directory or move
the affected cached files aside before rerunning. Generation from text may
vary over time; the stored hashes identify this exact export.

The source-specific crop assumes this recording's 1080-pixel-wide portrait
frame and crops to 1080×2170 at vertical offset 100. Adjust the crop and edit
plan when using a different recording. Rendering uses local Segoe UI fonts
and should run from the repository root. Review new exports again; cached
technical checks do not validate a changed file.
