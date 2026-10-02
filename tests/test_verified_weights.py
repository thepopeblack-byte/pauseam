"""Integrity checks with tiny unit fixtures; never model/participant evidence."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from text_service.verified_weights import file_matches, validate_manifest, load_verified_bucket


class VerifiedWeights(unittest.TestCase):
    def test_git_blob_and_large_file_hashes_detect_same_size_corruption(self):
        with tempfile.TemporaryDirectory() as root:
            path = Path(root) / "config.json"
            path.write_bytes(b"abc")
            for algorithm, digest in (("sha256", hashlib.sha256(b"abc").hexdigest()),
                    ("git-sha1", hashlib.sha1(b"blob 3\0abc").hexdigest())):
                entry = {"size": 3, "algorithm": algorithm, "digest": digest}
                self.assertTrue(file_matches(path, entry))
                path.write_bytes(b"abd")
                self.assertFalse(file_matches(path, entry))
                path.write_bytes(b"abc")

    def test_manifest_rejects_path_traversal_and_wrong_identity(self):
        manifest = {"model": "official", "revision": "pin", "files": [
            {"path": "../config.json", "size": 1, "algorithm": "sha256", "digest": "a" * 64}]}
        with self.assertRaises(RuntimeError):
            validate_manifest(manifest, "official", "pin")
        with self.assertRaises(RuntimeError):
            validate_manifest(manifest, "other", "pin")

    def test_valid_cache_is_reverified_without_network(self):
        with tempfile.TemporaryDirectory() as root:
            target = Path(root) / "cache" / "pin"
            target.mkdir(parents=True)
            (target / "config.json").write_bytes(b"abc")
            manifest = Path(root) / "manifest.json"
            manifest.write_text(json.dumps({"model": "official", "revision": "pin", "files": [
                {"path": "config.json", "size": 3, "algorithm": "sha256",
                 "digest": hashlib.sha256(b"abc").hexdigest()}]}), encoding="utf-8")
            self.assertEqual(load_verified_bucket("test/bucket", target.parent, manifest, "official", "pin"), str(target))
            (target / "unexpected.py").write_text("# unit fixture", encoding="utf-8")
            with self.assertRaises(RuntimeError):
                load_verified_bucket("test/bucket", target.parent, manifest, "official", "pin")

    def test_invalid_bucket_never_starts_network_request(self):
        for bucket in ("https://example.invalid", "../private", "a/b?token=private", "a/b/c"):
            with self.assertRaises(RuntimeError):
                load_verified_bucket(bucket, ".", "unused", "official", "pin")


if __name__ == "__main__":
    unittest.main()
