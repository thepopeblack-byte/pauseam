import importlib.util
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("secretvm", ROOT / "scripts/prepare-secretvm.py")
generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)


class DeploymentConfiguration(unittest.TestCase):
    def test_models_have_distinct_verified_sources_and_shared_license(self):
        fixture = "ghcr.io/example/test@sha256:" + "a" * 64
        config = generator.compose(fixture, fixture)
        for bucket in ("NigerianAccentedEnglish", "Yoruba-ASR", "Hausa-ASR", "Igbo-ASR"):
            self.assertIn("MODEL_BUCKET_ID: Blockcapitol/" + bucket + "-bucket", config)
        self.assertNotIn("N-ATLaS-bucket", config)
        self.assertIn('MODEL_BUCKET_ID: ""', config)
        self.assertEqual(config.count("licence:/home/"), 5)
        self.assertEqual(config.count("ports:"), 1)
        self.assertNotIn("--reload", config)
