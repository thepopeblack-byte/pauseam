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
    def test_complete_english_profile_uses_pinned_cpu_text_and_preserves_state(self):
        fixture = "ghcr.io/example/test@sha256:" + "a" * 64
        config = generator.compose(fixture,fixture,profile='english-complete')
        self.assertIn('  text:',config)
        self.assertIn('  asr-en:',config)
        self.assertIn('QUANTIZED_MODEL_CACHE: /home/app/models/quantized',config)
        self.assertIn('text-models:/home/app/models',config)
        self.assertIn('mem_limit: 10g',config)
        self.assertEqual(config.count('licence:/home/'),2)
        for paused in ('  asr-yo:','  asr-ha:','  asr-ig:','TEXT_DTYPE'):
            self.assertNotIn(paused,config)
        with self.assertRaises(ValueError):generator.compose(asr_image=fixture,profile='english-complete')

    def test_english_profile_keeps_ledger_and_excludes_paused_services(self):
        fixture = "ghcr.io/example/test@sha256:" + "a" * 64
        config = generator.compose(asr_image=fixture, profile="english-pilot")
        self.assertIn('  asr-en:', config)
        self.assertIn('MODEL_BUCKET_ID: Blockcapitol/NigerianAccentedEnglish-bucket', config)
        self.assertIn('licence:/home/inference/license', config)
        self.assertIn('asr-en-models:/home/inference/models', config)
        for paused in ('  text:', '  asr-yo:', '  asr-ha:', '  asr-ig:', '/text/*', 'TEXT_SERVICE_TOKEN'):
            self.assertNotIn(paused, config)
        self.assertEqual(config.count('ports:'), 1)
        self.assertIn('mem_limit: 4g', config)
        with self.assertRaises(ValueError):
            generator.compose(profile="english-pilot")

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
