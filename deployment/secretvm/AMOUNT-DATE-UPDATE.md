# Keep transaction amounts and dates in English voice

The website's typed and corrected-transcript paths accept amounts, dates and
transaction descriptions. Reports preserve the supplied description. The
11 October ASR update preserves recognised numeric and spoken amounts/dates
instead of hiding every number. It does not calculate, guess or correct values;
the user must review the transcript before requesting guidance.

## Update the existing pink-bandicoot VM

1. Open pink-bandicoot → Edit VM. Keep a private rollback copy of its current
   Compose configuration. Replace it with the contents of
   `deployment/secretvm/english-complete-compose.yml`.
2. Preserve the existing encrypted secrets, project and all persistent volumes.
   The only service image changed by this update is `asr-en`. Its exact image is:

   ```text
   ghcr.io/thepopeblack-byte/pauseam-asr@sha256:ed1ca075f99c268a5def7c20b91e49ca3e16059e776866906003e173b11e66a0
   ```

3. Apply the workload update. Confirm that the actual running `asr-en` container
   uses this image and becomes ready. Keep gateway and text configured as before.
   Do not create another VM, delete volumes or reset either usage ledger.
4. Tell the maintainer when it finishes. Authenticated `/asr/en/health` must report
   `privacyPolicy: payment-context-v2`, the official model ID and pinned revision.
   Saved Compose alone is not proof that the running workload changed.
5. Refresh `https://pauseam.theblockcapitol.com/?release=27`. Record a non-sensitive
   payment question in your own words that includes an amount and transaction
   date. Check both values, correct any recognition error and confirm the
   transcript. Request guidance and check the spoken reply and report preview.

No DNS, frontend settings, new secrets or Docker/PowerShell commands on the PC
are needed. A temporary restart of ASR may make voice unavailable during update.
The existing model cache can be reused. Text guidance remains connected to the
same host. Account/card/phone identifiers remain blocked or hidden; PINs, OTPs,
passwords and full credentials must never be entered.

## Build evidence

The image was built from commit
`9b8556caa86543a10c9bfaba9ea975e10f9e1467` in the successful
[ASR job](https://github.com/thepopeblack-byte/pauseam/actions/runs/38175336966/job/114576424929).
Anonymous registry access to the exact digest returned HTTP 200 and a matching
`docker-content-digest` on 11 October. The actual emitted digest is pinned above.
Local checks passed 84 JavaScript
tests, 32 Python tests and TypeScript checking. Those are deterministic
engineering tests, not participant sessions or proof of live speech accuracy.
Live typed/report verification preserved an authored ₦25,000.50 example dated
11/10/2026. Before the VM update, authenticated host health still reported
`numbers-redacted-v1`; automatic voice preservation requires the new image.
