"""Authored sanitizer fixtures only, not genuine ASR output or user records."""
import unittest
from asr.transcript_privacy import public_transcript

class TranscriptPrivacy(unittest.TestCase):
    def test_freeform_amount_date_keeps_payment_context(self):
        for text in ["I paid 25000 naira on 2 October but the seller disappeared.",
                     "I paid twenty five thousand naira yesterday and the seller blocked me.",
                     "I transferred ٢٥٠٠ naira and have not received my order."]:
            safe, redacted = public_transcript(text)
            self.assertTrue(redacted)
            self.assertIn("naira", safe)
            self.assertIn("[number removed]", safe)
            self.assertFalse(any(c.isdigit() for c in safe))

    def test_credentials_fail_without_returning_transcript(self):
        for text in ["My PIN is DUMMY_VALUE", "OTP: DUMMY_VALUE", "The account number is DUMMY_VALUE"]:
            with self.assertRaisesRegex(ValueError, "transcript discarded"):
                public_transcript(text)

    def test_contacts_and_spelled_digit_sequences_are_removed(self):
        safe, redacted = public_transcript("They said call 08000000000 or fixture@example.invalid and quote one two three four.")
        self.assertTrue(redacted)
        for value in ["08000000000", "fixture@example.invalid", "one two three four"]:
            self.assertNotIn(value, safe)

    def test_unscripted_question_unchanged_and_non_speech_rejected(self):
        text = "My transfer failed and the bank has not replied to my complaint."
        self.assertEqual(public_transcript(text), (text, False))
        for text in ["", "123456", "one two three four", "x"*1001]:
            with self.assertRaises(ValueError):
                public_transcript(text)
