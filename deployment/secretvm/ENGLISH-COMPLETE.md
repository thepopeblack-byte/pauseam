# English voice and N-ATLaS text on the existing 16 GB SecretVM

Use `english-complete-compose.yml`, not the historical full-precision or
four-language file. It contains gateway, text and asr-en only. The actual CPU
image built and passed offline imports/binary checks in
[run 37061753954](https://github.com/thepopeblack-byte/pauseam/actions/runs/37061753954).
Anonymous registry access to its exact digest passed on 2 October 2026.
These checks do not prove model inference on your VM.

Final text image digest starts `ed76b851` and the health response must identify
`contractVersion: reviewed-card-relevance-v1`. Earlier CPU images are historical.
If you already pasted the earlier contents, replace them with this final file;
the original downloaded weights and verified conversion can be reused.
Six genuine local CPU requests passed in 15.9–23.3 seconds, plus two guards
without inference. This does not promise the same timing on SecretVM.

## Owner update

1. Open the **existing** amaranth-nightingale VM â†’ Edit VM. Save a private copy
   of the current Compose configuration for rollback. Replace the Compose
   configuration with the complete contents of `english-complete-compose.yml`.
   Keep the existing project and persistent volumes. Do not delete the licence
   volume or run `docker compose down -v`.
2. Keep the existing encrypted `HF_TOKEN`, `TEXT_SERVICE_TOKEN` and
   `ASR_SERVICE_TOKEN`. They must match the server-side Sites secrets. Do not
   share their values. No new browser-side configuration is required. This
   Compose file deliberately uses the approved pinned official text repository;
   leave `MODEL_BUCKET_PREFIX` empty. English ASR uses its verified bucket root.
3. Apply the update. Confirm that only gateway, text and asr-en are active;
   stop the old Yoruba, Hausa and Igbo services if the dashboard retained them.
   Docker runs inside SecretVM. You do not need to run Docker or PowerShell on
   your PC. Do not launch a second VM.
4. First startup downloads and verifies the original N-ATLaS files, converts
   them with pinned llama.cpp, quantizes to Q4_K_M and verifies a local receipt.
   It temporarily needs roughly 40 GB of free model-volume space. The original
   files remain; only the generated FP16 intermediate is removed after success.
   Text memory is capped at 10 GB and English ASR at 3 GB. Startup can take a
   substantial time on CPU: no fixed loading-time promise is made. Inspect
   readiness and the first sanitized error if it fails.
5. Tell the build maintainer when the update finishes. Authenticated health and
   genuine text requests must pass before Sites `TEXT_ENABLED` is set to true.
   Test actual English audio, correction and guidance on the public app before
   inviting the full tester group. Do not publish a capability claim from
   readiness alone.

## Reproduce and verify (developer, private environment only)

```
python scripts/prepare-secretvm.py --profile english-complete --text-image ghcr.io/thepopeblack-byte/pauseam-text_cpu@sha256:ed76b8515257ae16ace80f47d66adc8fbd8c85fd0f5ca52dcbfa4395a44a26ed --asr-image ghcr.io/thepopeblack-byte/pauseam-asr@sha256:7f986b28e1beea961591d55ef435c0acb12434089b7628823281b8b62f3aba7b --output deployment/secretvm/english-complete-compose.yml
node --experimental-strip-types --env-file=private/secretvm/deployment.env scripts/verify-model-host.mjs --host https://amaranth-nightingale.vm.scrtlabs.com --scope english-complete --mode inference --output private/secretvm/english-complete-check.json
```

This command exercises text with a synthetic engineering question. It does not
create participant records or claim speech accuracy. A real consented recording
is required for voice verification. The official N-ATLaS API and organiser
acceptance of self-hosted ASR remain unverified; quantization is not fine-tuning.

For the complete eight-case engineering check after readiness:

```
node --experimental-strip-types --env-file=private/secretvm/deployment.env scripts/verify-text-inference.mjs --host https://amaranth-nightingale.vm.scrtlabs.com --output private/secretvm/final-text-check.json
```

## Rollback and operating limit

If conversion, latency or correctness fails, set Sites `TEXT_ENABLED=false`
before reverting to `english-pilot-compose.yml`. Preserve all persistent
volumes. Typed source checklists must be labelled as retrieval in evidence;
never label them N-ATLaS text inference. Keep the shared 950-reservation rolling
30-day pilot guard enabled. Seek separate licensing before exceeding the
published 1,000 active-end-user limit. Stop paid compute after agreed testing
and review. Stay within the owner's $150 total budget; existing costs count.
