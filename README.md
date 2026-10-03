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
Sites; the official speech and text models require a separate inference host.
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
transcripts use reviewed English source checklists. The pinned N-ATLaS 8B
Q4_K_M CPU relevance service is now live on the existing VM and enabled on Sites.
Six genuine authenticated HTTPS model requests passed in 6.1–6.8 seconds, plus
two pre-inference guards. Public checks passed 20 of 21: an ambiguous request
about different bank details produced a safe abstention instead of the expected
supplier card. Providing the supplier context worked in the actual browser.
This is a known comprehension limitation, not a clean all-pass release.
See [live text evidence](submission/evidence/live-text-inference-2026-10-02.json).
Earlier full-precision timeouts and local outcomes remain historical evidence.
No generic model is substituted. Official API access and fine-tuning are unverified.

No account is needed for text guidance. Never enter names, account numbers, PINs,
OTPs, passwords or full credentials. No raw audio retention is implemented.
This app cannot authenticate a person, account, receipt or payment or promise recovery.

Voice accepts payment questions in your own words; the sample is optional. The
3 October ASR update hides digits, spoken numbers and email addresses before
returning a transcript. Explicit credential disclosures still discard the
transcript. Review and correct the situation wording before requesting guidance;
do not restore private details. Typed and corrected questions now accept ordinary
payment amounts and dates. Unknown numeric identifiers, account/card/phone
numbers and explicit secret disclosures are rejected. Amount/date numbers are
omitted before the model request; they are unnecessary for checklist selection.
Both pinned services and the public
redacted-text guidance path passed [live engineering checks](submission/evidence/freeform-voice-live-2026-10-03.json).
The owner confirms the unscripted amount/date voice journey works; this is a
self-reported owner check, not participant validation. Accuracy review remains
pending. Silent or unreadable audio receives a recording error instead
of being described as a model outage.

Learn also answers customer-care email, phone and basic USSD-menu questions for
Access Bank, GTBank, UBA, Zenith, FirstBank, Fidelity, Wema/ALAT and Stanbic IBTC.
These are exact facts from a dated official-source directory, not generated
model contacts. Missing/ambiguous bank names prompt a bank choice; uncovered or
expired details abstain. No dial/transfer string, authentication or sender safety
verdict is produced. See [source review and maintenance](submission/evidence/bank-information-source-review-2026-10-03.md).

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

See [current technical documentation](submission/04-technical/technical-current.md)
and [the English deployment guide](deployment/secretvm/ENGLISH-COMPLETE.md) for
API contracts, configuration, deployment, privacy, source review and limitations.
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
