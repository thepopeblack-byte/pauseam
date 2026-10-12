# Replace the older English ASR workload

The authenticated public ASR health check on 12 October 2026 reported
`numbers-redacted-v1`. The published image pinned in the Compose file contains
`payment-context-v2`, including the health endpoint's policy constant. The
running code and the saved image configuration therefore do not match. Without
the running-container details, the exact deployment or routing cause remains
unconfirmed.

## Existing SecretVM dashboard

1. Keep a private rollback copy of the existing Compose configuration. Replace
   the whole Compose configuration on **pink-bandicoot** with
   `pink-bandicoot-recovery-compose.yml` from this directory. Preserve the
   encrypted secrets, existing Compose project and all named volumes.
2. Apply the workload update/redeploy, rather than only saving the editor or
   restarting an unchanged container. This configuration creates the service
   `asr-en-v2` and changes the gateway to route `/asr/en/*` to it. The public
   endpoint and website settings stay the same.
3. Confirm the running workload consists of `gateway`, `text` and `asr-en-v2`.
   Stop/remove the former `asr-en` **container only**, if it remains as an orphan.
   Do not leave both ASR services running: this host has 16 GB RAM. Do not remove
   the `asr-en-models` or `licence` volumes. Confirm the gateway was recreated
   with the updated routing command, too.
4. Wait for `asr-en-v2` readiness. Ask the maintainer to verify authenticated
   `/asr/en/health`: it must report `payment-context-v2`,
   `NCAIR1/NigerianAccentedEnglish` and revision
   `3c52c6e6c9ec508014a7b9db6a42b503b8930dff` before claiming the update is active.
5. Test a real, non-sensitive English recording with an amount and date. Review
   those values in the transcript, then confirm and request guidance. A health
   check alone is not a speech-accuracy test.

The recovery file preserves model images, model settings and persistent-volume
mounts. Its `usr/.env` references follow the owner's current SecretVM Compose
configuration. Do not upload that environment file to GitHub or share its
contents. No DNS changes, frontend deployment, new VM or local Docker setup is
required.

If the dashboard does not provide workload redeployment or container controls,
obtain those controls or contact SecretVM support with the sanitized discrepancy
above. Do not repeatedly change correct image digests or delete model/usage
volumes to work around a deployment-control problem.

## Configuration checks

The recovery YAML was parsed with `js-yaml`. Assertions checked the three service
names, gateway target, exact image references, unchanged model environment
settings and preservation of every named volume. This confirms configuration
consistency; it does not prove that SecretVM has applied the workload.
