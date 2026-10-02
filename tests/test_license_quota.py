"""Unit reservations, not users or completed interactions."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import tempfile
import unittest
from model_service.license_quota import LIMIT, WINDOW_SECONDS, reserve_model_use


class LicenceQuota(unittest.TestCase):
    def test_concurrent_calls_share_a_conservative_rolling_cap(self):
        with tempfile.TemporaryDirectory() as root:
            path = str(Path(root) / "usage.sqlite")
            for _ in range(LIMIT - 2):
                self.assertTrue(reserve_model_use(path, 10000000))
            with ThreadPoolExecutor(max_workers=8) as pool:
                results = list(pool.map(lambda _: reserve_model_use(path, 10000000), range(10)))
            self.assertEqual(sum(results), 2)
            self.assertFalse(reserve_model_use(path, 10000000 + WINDOW_SECONDS - 1))
            self.assertTrue(reserve_model_use(path, 10000000 + WINDOW_SECONDS))

    def test_missing_database_fails_closed(self):
        with self.assertRaises(RuntimeError):
            reserve_model_use("")


if __name__ == "__main__":
    unittest.main()
