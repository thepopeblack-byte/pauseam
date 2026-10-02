"""Prepare a portable single-host Compose deployment; never launch or buy compute."""
import argparse
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("compose_generator", ROOT / "scripts/prepare-secretvm.py")
generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--text-image", required=True, type=generator.image)
parser.add_argument("--asr-image", required=True, type=generator.image)
parser.add_argument("--output", required=True, type=Path)
args = parser.parse_args()
sources = json.loads((ROOT / "deployment/models/approved-sources.json").read_text())
config = generator.compose(args.text_image, args.asr_image)
config = config.replace("$DOMAIN_NAME {", "${MODEL_HOSTNAME:?Set the real inference hostname} {")
for language in ("en", "yo", "ha", "ig"):
    key = f"ASR_{language.upper()}_BUCKET_ID"
    config = config.replace("${" + key + ":-}", "${" + key + ":-" + sources[language]["bucket"] + "}")
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(config, encoding="utf-8")
print("Portable host configuration written. No credentials, model downloads or compute purchase performed.")
