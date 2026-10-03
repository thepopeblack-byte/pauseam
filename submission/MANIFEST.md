# PauseAm submission manifest

Ask before you pay. | Innovation & Enterprise | PS2: Voice-First Access
3 October 2026

## Delivered application
PauseAm is deployed at https://pauseam.theblockcapitol.com with Nigerian-accented
English voice and text. Version 25 includes payment questions, bank-first
reporting guidance, verified bank information, scam lessons, transcript correction,
spoken replies with text and replay/stop, and silent typed replies.

NCAIR1/NigerianAccentedEnglish performs transcription. NCAIR1/N-ATLaS checks
guidance relevance on the authenticated SecretVM host. Device speech provides
reply playback. Official API access and fine-tuning are not selected in ONDI.
Yoruba, Hausa and Igbo are outside this release's supported scope.

## Submission items
| Item | Evidence |
|---|---|
| 01 Working Artefact | [Application](https://pauseam.theblockcapitol.com), [repository](https://github.com/thepopeblack-byte/pauseam), [setup](01-artefact/README.md) |
| 02 N-ATLaS Integration Evidence | [Report](../output/pdf/02-natlas-integration.pdf), [upload note](../output/pdf/pauseam-integration-evidence-note.pdf), [actual request traces](evidence/spoken-replies-live-2026-10-03.json) |
| 03 Real-World Validation | [Testing report](../output/pdf/03-real-world-validation.pdf), [feedback collection](03-validation/validation-report.md) |
| 04 Technical Documentation | [PDF](../output/pdf/04-technical-documentation.pdf), [source](04-technical/technical-current.md), [deployment](../deployment/secretvm/ENGLISH-COMPLETE.md) |
| 05 Video Demonstration | [Video URL supplied in ONDI](https://youtu.be/Q-CDzLg24J0), [4:43 edit and checks](05-video/README.md), [render evidence](evidence/demo-video-edit-2026-10-03.json) |
| 06 Team Profile | [PDF](../output/pdf/06-team-profile.pdf), [roles and experience](06-team/team-profile.md) |
| 07 Endorsement / Registration | Required private CAC certificate or valid ID; [preparation checklist](07-registration/private-checklist.md) |

## Evidence totals
Thirty people have tested the application. Feedback collection is in progress.
The feedback form showed zero responses when checked on 3 October. Participant
completion, comprehension and speech-accuracy results have not been analysed.
The PS2 requirement is 50 documented real user interactions; the reported tester
count and reviewed interaction records are separate measures.

Version 25 passed 80 application tests, type checking, the production build and
ten public backend checks. Four genuine text-model requests took 5,960-7,803 ms.
Engineering checks are recorded separately from user testing.

The paid recovery-support service is a future business model: an agreed support
fee plus a percentage of money actually recovered, with legal-partner review and
case handling. The deployed guidance application does not move money, file a
complaint automatically or promise recovery.

See [release checks](RELEASE-GATE.md), [criterion matrix](evidence-matrix.md) and
[application answers](ondi-answer-drafts.json). Historical evidence files retain
the outcomes and dates of the releases they measured.
