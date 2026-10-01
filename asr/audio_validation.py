"""WAV validation without loading model dependencies."""
import io
import wave

MAX_BYTES = 960044


def validate_pcm(raw):
    if not 44 <= len(raw) <= MAX_BYTES:
        raise ValueError("Audio size is outside the allowed range")
    with wave.open(io.BytesIO(raw), "rb") as wav:
        frames = wav.getnframes()
        if (wav.getnchannels() != 1 or wav.getframerate() != 16000
                or wav.getsampwidth() != 2 or wav.getcomptype() != "NONE"
                or not 8000 <= frames <= 480000):
            raise ValueError("Expected mono 16 kHz PCM16, 0.5–30 seconds")
        pcm = wav.readframes(frames)
        if len(pcm) != frames * 2:
            raise ValueError("Truncated audio")
        return pcm

