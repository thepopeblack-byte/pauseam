"""Authored sanitizer fixtures only, not genuine ASR output or user records."""
import unittest
from asr.transcript_privacy import public_transcript

class TranscriptPrivacy(unittest.TestCase):
    def test_freeform_amount_date_keeps_payment_context(self):
        for text in ["I paid 25000 naira on 2 October but the seller disappeared.",
                     "I paid twenty five thousand naira yesterday and the seller blocked me.",
                     "I transferred ₦25,000.50 on 11/10/2026 for an order via my bank app.",
                     "The transaction was 25000 on 11.10.2026 at 10:30.",
                     "I lost 5000 on 11/10/26.",
                     "I paid twenty five thousand naira on October third two thousand twenty six."]:
            safe, redacted = public_transcript(text)
            self.assertFalse(redacted, text)
            self.assertEqual(safe, text)

    def test_unknown_numbers_stay_hidden_without_losing_amount_or_date(self):
        text = "I paid 25000 naira on 11/10/2026 to 1234567890 for an order."
        safe, redacted = public_transcript(text)
        self.assertTrue(redacted)
        self.assertIn("25000 naira on 11/10/2026", safe)
        self.assertNotIn("1234567890", safe)
        for text in ["I paid 1234567890 naira", "I paid １２３４ naira", "I paid on 31/02/2026", "I paid one two three four naira"]:
            safe, redacted = public_transcript(text)
            self.assertTrue(redacted, text)
            self.assertIn("[number removed]", safe)

    def test_credentials_fail_without_returning_transcript(self):
        for text in ["My PIN is DUMMY_VALUE", "OTP: DUMMY_VALUE", "The account number is DUMMY_VALUE", "PIN 5000 naira", "account number ₦5000", "My DOB is 11/10/2026", "My phone number is 08000000000", "account number one two three four"]:
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
