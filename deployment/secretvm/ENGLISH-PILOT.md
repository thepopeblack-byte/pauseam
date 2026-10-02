# Voice-only rollback on the existing 16 GB SecretVM

For the current English voice **and N-ATLaS text** target, use
[ENGLISH-COMPLETE.md](ENGLISH-COMPLETE.md). This file describes the fallback
without a text model; it is not the complete submission deployment.

Use `english-pilot-compose.yml` for amaranth-nightingale. This runs only Caddy
and the pinned official Nigerian-accented-English ASR model. It allocates at most
4 GB to ASR and 256 MB to Caddy, leaving RAM for the OS. Four ASR CPU threads are
configured; latency must be measured after this update, not assumed.

The website stays at https://pauseam.theblockcapitol.com. English typed questions
and corrected voice transcripts retrieve reviewed source checklists. There is no
generative text model in this profile. Yoruba, Hausa and Igbo are paused in the
website and API. Their code, provenance and historical reports are preserved.

## Update the existing VM yourselves

1. Open the existing VM's Edit VM / Docker App configuration. Preserve its
   persistent state, provider-managed Compose project name, `licence` ledger,
   `asr-en-models`, and Caddy volumes. Do not create a replacement VM or reset
   the licence database. The supplied screenshot reports upgradeability and
   persistence enabled; confirm both before applying the workload update.
2. Replace the old Compose contents with `english-pilot-compose.yml`. Keep the
   portal's extra HTTPS injection off; the gateway handles HTTPS. Keep the
   existing encrypted ASR_SERVICE_TOKEN matching the website. Other existing
   secrets may remain; they do not launch disabled services. No token goes in
   the Compose file. MODEL_BUCKET_PREFIX remains empty as generated.
3. Apply the update. Verify that **only gateway and asr-en are running**.
   If the portal leaves the old containers running, stop `text`, `asr-yo`,
   `asr-ha` and `asr-ig` through its Docker App controls. With shell access in
   the existing Compose project, `docker compose stop text asr-yo asr-ha asr-ig`
   can stop those old services **before** replacing its old Compose file.
   Do not delete volumes. The small file cannot free RAM until old services stop.
4. Check English readiness privately from this PC's repository folder:

   ```powershell
   node --experimental-strip-types --env-file=private/secretvm/deployment.env scripts/verify-model-host.mjs --host https://amaranth-nightingale.vm.scrtlabs.com --scope english --mode health --output private/secretvm/english-readiness.json
   ```

   Health is not speech-accuracy evidence. `/asr/en/health` must return the official
   pinned identity. `/text/*` and the other ASR paths intentionally return 404 in
   this profile. Do not use the default five-model check for this deployment.
5. Refresh PauseAm. Record a short, consented English question with no private
   details. Listen, transcribe, correct and confirm the transcript, then request
   the checklist and open its source. Record actual latency and observed defects.
   Do not count an engineering smoke test as completed research validation.

## Resource and capability limits

The supplied host screenshot reports 16 GB RAM, 8 vCPUs, 160 GB disk, and
$0.24/hour. That rate is $5.76 per running day, excluding other charges; billing
has not been independently checked. Keep within the existing $150 total budget
and stop paid compute after review/testing.

The previous five-model stack was sized for at least 32 GB. The pinned N-ATLaS
8B text model's bfloat16 weights alone are roughly 16 GB, before activations,
runtime and English ASR. Removing three ASRs does not make that text model fit
reliably on this host. Actual text requests exceeded 45 and 180 seconds; TEXT_ENABLED
remains false and this profile does not load it. A future larger host or a verified
quantised version of the same official model needs genuine latency, quality and
licence tests before use. No substitute text model, official API proof or
fine-tuning is claimed.

The shared conservative 950-request rolling ledger remains in the existing
`licence` volume. Keep the inactive Hugging Face alternative off; do not fork or
reset the ledger when upgrading. Larger compute alone does not validate language
accuracy, safety wording, or the organisers' official-ASR-service requirement.

## Reproduce this file

```powershell
python scripts/prepare-secretvm.py --profile english-pilot --asr-image ghcr.io/thepopeblack-byte/pauseam-asr@sha256:7f986b28e1beea961591d55ef435c0acb12434089b7628823281b8b62f3aba7b --output deployment/secretvm/english-pilot-compose.yml
```

The historical `pauseam-compose.yml` remains the full five-model deployment for
future adequately sized hosts. It is not the current 16 GB pilot file.
