"""Prepare ignored SecretVM credentials, excluding stale model overrides."""
import argparse
from pathlib import Path
import secrets

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--source", type=Path, default=ROOT / "private/secretvm/pilot.env")
args = parser.parse_args()
destination = ROOT / "private/secretvm/deployment.env"
if destination.exists():
    raise SystemExit("Private deployment.env already exists; left unchanged.")
values = {}
if args.source.is_file():
    for line in args.source.read_text(encoding="utf-8-sig").splitlines():
        if "=" in line:
            key, value = line.split("=", 1)
            if key in ("HF_TOKEN", "ASR_SERVICE_TOKEN", "TEXT_SERVICE_TOKEN"):
                values[key] = value.strip()
for key in ("ASR_SERVICE_TOKEN", "TEXT_SERVICE_TOKEN"):
    if len(values.get(key, "")) < 32:
        values[key] = secrets.token_urlsafe(48)
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_text("\n".join(f"{key}={values.get(key, '')}" for key in
    ("HF_TOKEN", "ASR_SERVICE_TOKEN", "TEXT_SERVICE_TOKEN")) + "\n", encoding="utf-8")
print("Created ignored private/secretvm/deployment.env. Values were not printed. Enter HF_TOKEN privately if empty.")
