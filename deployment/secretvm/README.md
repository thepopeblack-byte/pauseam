# PauseAm inference on the existing SecretVM

Current target: **English voice and N-ATLaS text on the existing 16 GB RAM,
8-vCPU, 160 GB VM** at amaranth-nightingale.vm.scrtlabs.com.
The website stays on Sites at https://pauseam.theblockcapitol.com.

## Use this deployment

Follow [ENGLISH-COMPLETE.md](ENGLISH-COMPLETE.md) and replace the existing VM's
Compose configuration with **english-complete-compose.yml**. Keep encrypted
secrets and persistent volumes. Apply the workload update in the dashboard;
editing a file alone does not prove that the running containers changed.
No Docker or PowerShell command is required on the owner's PC.

The active services must be gateway, text, and asr-en. The text image must
be ghcr.io/thepopeblack-byte/pauseam-text_cpu at the digest beginning
ed76b851; the full immutable digest is in the Compose file. This is the
official pinned N-ATLaS model converted to Q4_K_M, not a different model and
not fine-tuning. Other languages remain paused for this compute budget.

Authenticated /text/health must report runtime: llama.cpp,
quantization: Q4_K_M, and contractVersion: reviewed-card-relevance-v1,
along with the official model ID/revision. A response identifying
dtype: torch.bfloat16 without those CPU fields is the historical runtime.
HTTP 200 alone is insufficient. First startup may need substantial time for
verified download, conversion, and loading.

The maintainer verifies real model responses and latency before setting Sites
TEXT_ENABLED=true. Do not expose secrets, bypass that check, create another
VM, delete persistent volumes, or reset the shared licence ledger.

## Other files

- [ENGLISH-PILOT.md](ENGLISH-PILOT.md) and english-pilot-compose.yml are the
  **voice-only rollback**. They intentionally do not run N-ATLaS text.
- pauseam-compose.yml is a historical five-model profile for larger compute.
  Do not use it on the current 16 GB VM.
- Hugging Face hosting files are an inactive alternative. Do not run a second
  independent licence ledger alongside this deployment.

The published model licence limits active end users to 1,000 within a rolling
30-day period; the pilot keeps its conservative shared 950-reservation guard.
Seek separate licensing before exceeding the published limit. Existing compute
costs count toward the owner's $150 total; stop after agreed review/testing.

Self-hosted model inference is not proof of official N-ATLaS API use.
Organiser confirmation that this ASR deployment satisfies PS2's official-service
wording remains pending. See [the submission release gate](../../submission/RELEASE-GATE.md).

