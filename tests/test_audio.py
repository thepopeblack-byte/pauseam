import io
import unittest
import wave
from asr.audio_validation import validate_pcm


def make_wav(channels=1, rate=16000, frames=8000):
    target = io.BytesIO()
    with wave.open(target, "wb") as wav:
        wav.setnchannels(channels)
        wav.setsampwidth(2)
        wav.setframerate(rate)
        wav.writeframes(b"\x01\x00" * frames * channels)
    return target.getvalue()


class AudioValidation(unittest.TestCase):
    def test_valid_pcm(self):
        self.assertEqual(len(validate_pcm(make_wav())), 16000)

    def test_truncated_payload(self):
        with self.assertRaises(ValueError):
            validate_pcm(make_wav()[:-10])

    def test_wrong_channels(self):
        with self.assertRaises(ValueError):
            validate_pcm(make_wav(channels=2))

    def test_wrong_rate(self):
        with self.assertRaises(ValueError):
            validate_pcm(make_wav(rate=44100))

    def test_too_short(self):
        with self.assertRaises(ValueError):
            validate_pcm(make_wav(frames=7000))

    def test_oversized(self):
        with self.assertRaises(ValueError):
            validate_pcm(b"x" * 960045)


if __name__ == "__main__":
    unittest.main()

