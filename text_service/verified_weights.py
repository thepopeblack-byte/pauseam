"""Verify a user-configured bucket against official, revision-pinned file bytes.

Unit checks are not inference evidence. The service must finish every checksum
before Transformers can open the directory. Bucket revisions/Xet hashes alone
do not establish identity with the official model.
"""
import hashlib
import json
import os
from pathlib import Path
import re
import time
import urllib.parse
import urllib.request


def file_matches(path, entry):
    if not path.is_file() or path.is_symlink() or path.stat().st_size != entry["size"]:
        return False
    digest = hashlib.sha256() if entry["algorithm"] == "sha256" else hashlib.sha1()
    if entry["algorithm"] == "git-sha1":
        digest.update(f'blob {entry["size"]}\0'.encode())
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest() == entry["digest"]


def validate_manifest(manifest, model, revision):
    if manifest.get("model") != model or manifest.get("revision") != revision:
        raise RuntimeError("Unexpected model manifest")
    files = manifest.get("files", [])
    if not files or len({e["path"] for e in files}) != len(files):
        raise RuntimeError("Invalid manifest file list")
    for entry in files:
        if not re.fullmatch(r"[A-Za-z0-9_.-]+", entry["path"]) or entry["path"] in (".", ".."):
            raise RuntimeError("Invalid model file path")
        if entry["algorithm"] not in ("sha256", "git-sha1") or not isinstance(entry["size"], int) or entry["size"] < 1:
            raise RuntimeError("Invalid model checksum")
        size = 64 if entry["algorithm"] == "sha256" else 40
        if not re.fullmatch(r"[0-9a-f]{" + str(size) + "}", entry["digest"]):
            raise RuntimeError("Invalid model checksum")
    return files


def load_verified_bucket(bucket_id, cache_root, manifest_path, model, revision):
    if not re.fullmatch(r"[A-Za-z0-9_-]+/[A-Za-z0-9_.-]+", bucket_id):
        raise RuntimeError("Invalid bucket ID")
    manifest = json.loads(Path(manifest_path).read_text(encoding="utf-8"))
    files = validate_manifest(manifest, model, revision)
    target = Path(cache_root) / revision
    target.mkdir(parents=True, exist_ok=True)
    if target.is_symlink():
        raise RuntimeError("Model cache must not be a symbolic link")
    expected = {entry["path"] for entry in files}
    if any(p.name not in expected and not p.name.endswith(".download") for p in target.iterdir()):
        raise RuntimeError("Unexpected files in pinned model cache")
    for entry in files:
        final = target / entry["path"]
        if file_matches(final, entry):
            continue
        temporary = target / (entry["path"] + ".download")
        # Never print URLs: bucket redirects may carry short-lived credentials.
        url = "https://huggingface.co/buckets/" + bucket_id + "/resolve/" + urllib.parse.quote(entry["path"])
        success = False
        for attempt in range(3):
            try:
                count = 0
                request = urllib.request.Request(url, headers={"User-Agent": "PauseAm-verified-model-loader/1"})
                with urllib.request.urlopen(request, timeout=120) as response, temporary.open("wb") as stream:
                    for block in iter(lambda: response.read(1024 * 1024), b""):
                        count += len(block)
                        if count > entry["size"]:
                            raise ValueError("Oversized model file")
                        stream.write(block)
                if not file_matches(temporary, entry):
                    raise ValueError("Model checksum mismatch")
                os.replace(temporary, final)
                success = True
                break
            except Exception:
                temporary.unlink(missing_ok=True)
                if attempt < 2:
                    time.sleep(2 ** attempt)
        if not success:
            raise RuntimeError("Pinned model download or checksum failed") from None
    # Recheck the entire directory, including existing cache files.
    if not all(file_matches(target / entry["path"], entry) for entry in files):
        raise RuntimeError("Pinned model verification failed")
    return str(target)
