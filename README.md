# PauseAm

The consumer app has three paths: ask a payment question, prepare a report, and learn a warning sign. Report drafts are created locally from a privacy-checked description; users review and send them themselves. Banking evidence and credentials are not collected. The bank-first/CBN guide and dated ngCERT learning catalog are documented in [reporting and learning evidence](submission/evidence/reporting-learning-2026-10-02.md).

Learning updates are selected official notices maintained by the team, not a live news feed. Refresh and human-review the catalog before its 9 October expiry; stale entries are withheld automatically. Technical provenance and consent-based research tools are separate from ordinary consumer navigation at `/evaluation`; `/api/status` describes actual model configuration.
## Ask before you pay.

A payment decision companion for NAIC 2026, Innovation & Enterprise, PS2.
**Review build, not submission-ready. No ONDI application has been submitted.**

Public repository: https://github.com/thepopeblack-byte/pauseam
Site: https://pauseam.theblockcapitol.com

Custom domain: pauseam.theblockcapitol.com (DNS and HTTPS active, verified 2 October).
See [Sites and Namecheap setup](deployment/sites/README.md). The app runs on
Sites; the Python/PyTorch models still require a separate inference host.
Use the [current English CPU deployment guide](deployment/secretvm/ENGLISH-COMPLETE.md) for inference.
The current pilot is English only. A real English recording produced a transcript
through the public app on 2 October (15.8 seconds server duration); accuracy review
and completed research validation remain pending. The team-operated host has
16 GB RAM, 8 vCPUs and 160 GB disk. Use the lightweight English Compose profile;
the full five-model stack is unsuitable for this host. No new host was purchased.

Implemented: mobile-first English source checklists, three journeys, private incident
timeline/export, general-checklist sharing, consent-based local evaluation, real
page Web Vitals and official Nigerian-accented-English ASR. Yoruba, Hausa and Igbo
adapters are preserved but paused in the UI and API. Typed questions and corrected
transcripts use reviewed English source checklists. The N-ATLaS 8B text adapter
remains implemented but disabled: real requests exceeded 45 and 180 seconds and
its roughly 16 GB bfloat16 weights leave insufficient RAM for runtime plus ASR.
The new pinned same-model Q4_K_M CPU container is built and anonymously pullable;
actual conversion, relevance and live-VM latency must pass before it is enabled.
No generic model is substituted. Official API access and fine-tuning are unverified.

No account is needed for text guidance. Never enter names, account numbers, PINs,
OTPs, passwords or full credentials. No raw audio retention is implemented.
This app cannot authenticate a person, account, receipt or payment or promise recovery.

## Run and test
Node >=22.13:
npm ci --no-audit --no-fund
npm run dev
npm test
npm run typecheck
npm run build

Python audio checks:
python -m unittest tests.test_audio -v

With the server running:
npm run test:http

See submission/04-technical/technical-documentation.md and submission/04-technical/model-hosting.md for API,
configuration, deployment, privacy, source review and model limitations.
The current shell may require invoking npm-cli.js through node instead of npm.cmd.

## Submission evidence
Start with submission/MANIFEST.md, submission/RELEASE-GATE.md and
submission/evidence-matrix.md. PDFs are in output/pdf.
200+ people are prospective testers; no completed human interactions are claimed.
Research and identity files must remain private and outside this repository.
Current model terms cap 1,000 active end users per rolling 30 days; obtain separate
licensing before exceeding that and verify counting before public inference.

N-ATLaS is an initiative of the Federal Ministry of Communications, Innovation and
Digital Economy, and powered by Awarri Technologies.

## Source maintenance
The CBN source register was checked by Codex on 1 October 2026 and expires
1 November 2026. Independent human safety review and fluent language review are pending.
Scenario adaptations are labelled. No trademark or domain clearance is claimed
for PauseAm; see submission/name-check.md.
