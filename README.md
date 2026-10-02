# PauseAm
## Ask before you pay.

A payment decision companion for NAIC 2026, Innovation & Enterprise, PS2.
**Review build, not submission-ready. No ONDI application has been submitted.**

Public repository: https://github.com/thepopeblack-byte/pauseam
Site: https://pauseam.theblockcapitol.com

Custom domain: pauseam.theblockcapitol.com (DNS and HTTPS active, verified 2 October).
See [Sites and Namecheap setup](deployment/sites/README.md). The app runs on
Sites; the Python/PyTorch models still require a separate inference host.
Use the [SecretVM self-deployment guide](deployment/secretvm/README.md) for inference.
The Hugging Face CPU package is an inactive alternative. Live model inference
remains unverified; no new host was launched during this review.

Implemented: mobile-first English source checklists, three journeys, private incident
timeline/export, general-checklist sharing, consent-based local evaluation, real
page Web Vitals, strict four-language official ASR adapters and constrained N-ATLaS
text-model service. The model services have not been configured or validated live.
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
