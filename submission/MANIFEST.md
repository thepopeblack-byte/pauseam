# PauseAm submission manifest

**Current scope, 2 October: English-only pilot at the team's request.** The live
English voice request returned HTTP 200 and a transcript in 15.8 seconds after
the Workers redirect fix. Accuracy and comprehension review are pending; this
owner smoke test does not add completed research participants. Typed guidance
uses reviewed source checklists. N-ATLaS text inference is disabled after genuine
timeouts; Yoruba, Hausa and Igbo are paused. Use the [16 GB English deployment
guide](../deployment/secretvm/ENGLISH-PILOT.md). Earlier reports and PDFs describe
historical scope and must not be presented as current four-language evidence.
See [actual voice evidence](evidence/worker-redirect-fix-2026-10-02.json).
The [English pilot release checks](evidence/english-pilot-2026-10-02.json)
record Sites version 12, all 19 public baseline checks, and English ASR readiness.
The later [consumer redesign release](evidence/consumer-redesign-2026-10-02.json)
records version 13, 47 passing tests, 24 passing live checks, a simplified mobile
question flow and broader everyday payment phrasing. Text generation remains
paused. These engineering checks are not participant validation.
Applying the smaller VM workload and observing a complete corrected-transcript
journey remain pending. English typed guidance is source retrieval, not N-ATLaS
text generation.

Ask before you pay. Innovation & Enterprise / PS2: Voice-First Access.
Review package updated 2 October 2026. **Overall blocked; do not submit ONDI.**
Deadline: 12 October 2026, 11:59 p.m. West Africa Time.

| Item | Status | Review artefact and evidence | Exact remaining action |
|---|---|---|---|
| 01 Working Artefact | blocked | [Setup](01-artefact/README.md), [public source](https://github.com/thepopeblack-byte/pauseam), [public app](https://pauseam.theblockcapitol.com), [English pilot checks](evidence/english-pilot-2026-10-02.json) | Apply the smaller VM stack, verify the complete English corrected-transcript journey and representative device testing; other languages are deferred |
| 02 Integration Evidence | blocked | [Source](02-integration/integration-evidence.md), [access register](02-integration/access-and-models.md), [review PDF](../output/pdf/02-natlas-integration.pdf) | Actual model traces/screenshots; organiser service answer; official API proof if claimed; fine-tuning evidence if claimed |
| 03 Real-World Validation | blocked | [Protocol](03-validation/discovery-pack.md), [report](03-validation/validation-report.md), [empty log schema](03-validation/interactions-template.csv), [review PDF](../output/pdf/03-validation-status.pdf) | Discovery, fluent reviews and at least 50 completed documented PS2 interactions; reconcile counts |
| 04 Technical Documentation | blocked | [Source](04-technical/technical-documentation.md), [hosting](04-technical/model-hosting.md), [review PDF](../output/pdf/04-technical-documentation.pdf) | Reproduce actual model deployment and update measured results, costs and limitations |
| 05 Video Demonstration | blocked | [Capture procedure](05-video/capture-plan.md) | Record actual functioning product in 3–5 minute MP4, caption, verify playback/audio and watch entire export |
| 06 Team Profile | blocked | [Source](06-team/team-profile.md), [review PDF](../output/pdf/06-team-profile-review.pdf) | Review the provided facts; retain Suleiman as Technical lead without inventing further details |
| 07 Endorsement / Registration | blocked | [Private checklist](07-registration/private-checklist.md), [checklist PDF](../output/pdf/07-registration-checklist.pdf) | Provide appropriate private CAC certificate or valid ID; this checklist is not that item |

The five PDFs are genuine status/review documents, not substitutes for missing
integration, validation or identity evidence. There is no demonstration MP4.
200+ willing prospective testers have been reported; documented PS2 interactions
are **0**, as reconciled in [actual totals](evidence/validation-totals.json).

## Historical evidence (earlier builds; not current capability claims)

Real text loading passed on the team-operated HTTPS host. The first actual
guidance request failed its strict contract and was withheld. See the
[genuine first trace](evidence/text-inference-first-attempt-2026-10-02.json),
[image update](evidence/model-container-update-2026-10-02.json) and
[authenticated ASR access failures](evidence/asr-authenticated-access-2026-10-02.json).
No completed voice journey or official API request is inferred from this evidence.
The current [Sites/domain setup](../deployment/sites/README.md) registers
pauseam.theblockcapitol.com and records exact Namecheap DNS values. DNS/TLS are
active; a genuine inference host remains pending. The latest [public-app release checks](evidence/custom-domain-public-app-2026-10-02.json)
passed all 15 baseline checks and correctly failed the model release gate.
The later [bucket byte audit](evidence/bucket-audit-2026-10-02.json) confirms the
complete Igbo files, not speech inference. Deployment is user-operated using the
[pinned package and instructions](../deployment/secretvm/README.md); this remains
the historical provider guide, while the current preference is Sites plus a
separate compatible model host.

All four new ASR buckets now match all 51 required official files, including
each full weight file. This is file provenance, not voice validation. A
[Hugging Face CPU package](../deployment/huggingface-space/README.md) and
[code-only upload ZIP](../output/huggingface-space/pauseam-hf-cpu-space.zip) are
prepared. Text uses the pinned approved official repository because the mixed
text bucket still fails its small-file audit. No Space or successful new
inference is claimed. Historical failure reports remain unchanged.

The combined CPU container built and imported successfully in
[actual CI run 36967883845](https://github.com/thepopeblack-byte/pauseam/actions/runs/36967883845).
See [package/runtime results](evidence/hf-cpu-preparation-2026-10-02.json).
Sites version 9 deployed the quota route and created its timestamp-only D1 table;
the private quota credential remains unconfigured. All 16 new
[public baseline checks](evidence/hf-cpu-app-release-2026-10-02.json) passed,
while the genuine-model release gate correctly remained failed. Updated
[PDF visual/hash review](evidence/pdf-cpu-update-review-2026-10-02.json) covers
the eight rendered integration/technical pages. None of this creates participant
validation, working speech, official API proof or fine-tuning evidence.

See the [full release gate](RELEASE-GATE.md), [six-criteria matrix](evidence-matrix.md),
[ONDI drafts](portal-and-form-drafts.md), [engineering review](evidence/engineering-review.md)
and [organiser query](organiser-query.md). No application was submitted.

Public production endpoints passed 15 anonymous HTTP checks. All three payment
safety source URLs returned HTTP 200. [Actual performance](evidence/performance-report.md)
includes failed targets and test conditions; viewport checks are not real Android
or field validation. [PDF page and hash review](evidence/pdf-review.json) covers
all five rendered review documents.

Public PDFs and source files contain no tokens, recordings or ID documents.
Research logs and identity evidence belong outside Git under the ignored private
directory. Rebuild PDFs with `python scripts/build-submission-pdfs.py` using
ReportLab and Segoe UI (Windows) or DejaVu Sans (Linux); visually review again after
any content change. `scripts/validate-research.py` checks log consistency, not truth.
