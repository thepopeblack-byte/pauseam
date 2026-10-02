# Model-host preparation — 2 October 2026

This is engineering evidence, not completed model inference or human validation.

- Two actual Linux amd64 images were built successfully in run 36953301322 from
  commit 56b8aed2f56ce1c7c756db63bdece6165887db39. Exact digests and independently
  verified anonymous registry access are in model-container-build-2026-10-02.json.
- Twelve Python unit tests passed locally and in the container-build workflow:
  six WAV-format checks, four model-file integrity checks, and two shared quota
  checks. These fixtures are not participants, transcripts or model responses.
- Seven actual small text-model files from the configured mirror matched the
  official pinned Git blob checksums: .gitattributes, README.md, config.json,
  generation_config.json, model.safetensors.index.json, special_tokens_map.json,
  and tokenizer_config.json. No full-weight verification is claimed here.
- Official public checksum manifests were prepared for the five models. The ASR
  manifests cover inference files and licence/model-card text, excluding optimizer,
  scheduler, RNG and trainer-state files. Remote code is disabled; ASR binary
  weights use PyTorch's restricted weights-only parser.
- The conservative shared SQLite ceiling is 950 reservations per rolling 30 days,
  including failures. The deployment stores timestamps only. All five services
  must share the same database; do not reset it or deploy parallel independent caps.
- A digest-pinned Caddy gateway provides CA-issued HTTPS. Model services have no
  external plaintext port. The portal's additional HTTPS injection creates a
  duplicate proxy and must remain off for this configuration; Caddy still serves
  ports 80/443. HTTPS certificate validity must be verified after provisioning.
- The private Compose file passed Docker Compose's structural validation. Its
  $DOMAIN_NAME placeholder is substituted by SecretVM at provisioning. Host runtime
  information is configured to be private. Runtime behaviour still needs testing.

At this checkpoint: no VM has launched, no complete model weights have loaded,
no inference has succeeded, and the app's inference switches remain disabled.
The official N-ATLaS API and organiser acceptance of self-hosted ASR are unverified.

Offline runtime verification subsequently passed in run 36954468678. The actual
digest-pinned ASR and text images imported successfully with no network and no
credentials. Torch 2.6.0+cpu, Transformers 4.49.0 and cudaAvailable=false were
reported by the running containers. Exact resolved dependencies and JSON output
are in model-container-runtime-2026-10-02. Both records explicitly report
inferencePerformed=false. This check is not weight-loading or ASR evidence.
