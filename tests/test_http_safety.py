import unittest
from model_service.http_safety import valid_bearer, append_bounded


class HTTPGuards(unittest.TestCase):
    def test_malformed_auth_never_raises_or_authenticates(self):
        token = "engineering-test-only" * 2
        for header in ("", "Bearer wrong", "Bearer é", "x" * 4097, None):
            self.assertFalse(valid_bearer(header, token))
        self.assertTrue(valid_bearer("Bearer " + token, token))
        self.assertFalse(valid_bearer("Bearer ", ""))

    def test_oversized_chunk_is_not_copied(self):
        buffer = bytearray(b"ab")
        self.assertFalse(append_bounded(buffer, b"xyz", 4))
        self.assertEqual(buffer, b"ab")
        self.assertTrue(append_bounded(buffer, b"cd", 4))
        self.assertEqual(buffer, b"abcd")
