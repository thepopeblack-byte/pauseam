import importlib.util
from pathlib import Path
import unittest
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("secretvm", ROOT / "scripts/prepare-secretvm.py")
generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)


class DeploymentConfiguration(unittest.TestCase):
    def test_upload_archive_uses_platform_independent_text_and_metadata(self):
        spec = importlib.util.spec_from_file_location("space_package", ROOT / "scripts/prepare-hf-space.py")
        package = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(package)
        with tempfile.TemporaryDirectory() as temporary:
            destination = Path(temporary) / "upload"
            package.package(destination)
            with zipfile.ZipFile(destination / "pauseam-hf-cpu-space.zip") as archive:
                self.assertIn("http_safety.py", archive.namelist())
                for item in archive.infolist():
                    self.assertEqual(item.create_system, 3)
                    self.assertNotIn(b"\r\n", archive.read(item))

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
