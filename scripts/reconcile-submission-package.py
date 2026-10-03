"""Reconcile current submission facts without rewriting historical evidence."""
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
manifest = '''# PauseAm submission manifest

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
'''
gate = '''# PauseAm release checks

3 October 2026 | Innovation & Enterprise | PS2: Voice-First Access

The deployed application and submission eligibility are checked separately.
ONDI's current build status is Fully deployed and live. All 31 required fields
are filled. Final submission remains a human action.

| Requirement | Status | Evidence | Remaining action |
|---|---|---|---|
| Public application and repository | passed | https://pauseam.theblockcapitol.com; https://github.com/thepopeblack-byte/pauseam | Preserve the English release and evaluate reported defects |
| English ASR and N-ATLaS text integration | passed | evidence/spoken-replies-live-2026-10-03.json; evidence/live-text-inference-2026-10-02.json | Preserve pinned models, server credentials and persistent licence ledger |
| Voice replies, correction, replay/stop and silent text | passed | evidence/spoken-replies-release-2026-10-03.json; tests/speech.test.ts | Record representative device outcomes with user feedback |
| Amount/date questions and combined bank contacts | passed | evidence/payment-bank-combined-live-2026-10-03.json; evidence/freeform-voice-live-2026-10-03.json | Maintain official bank sources and distinguish numeric ASR redaction from transcription accuracy |
| Tests, setup, deployment and technical documentation | passed | ../output/pdf/04-technical-documentation.pdf; evidence/spoken-replies-release-2026-10-03.json | Document any later release's changed measurements |
| PDF consistency and formatting | passed | evidence/submission-prose-review-2026-10-03.json | Keep updated files attached to ONDI |
| Privacy and licence implementation | passed | lib/model-quota.ts; lib/text-model.ts; confidentiality-positioning.md | Maintain source reviews and shared ledger; obtain separate licensing before commercial use or exceeding 1,000 rolling active end users |
| Team profile | passed | ../output/pdf/06-team-profile.pdf | Maintain the supplied names, roles and experience |
| Minimum 50 documented real user interactions | failed | 03-validation/validation-report.md; ONDI count: 30 | Complete and document at least 50 real interactions, reconcile records and analyse feedback |
| Participant feedback results | blocked | Team feedback form: zero responses at this check | Collect consented feedback and publish actual findings, defects and retests |
| Official ASR-service qualification | blocked | organiser-query.md; 02-integration/integration-current.md | Obtain the organisers' confirmation of self-hosted official weights qualifying as the required service |
| Evaluator-accessible video verification | blocked | https://youtu.be/Q-CDzLg24J0; evidence/demo-video-edit-2026-10-03.json | Check playback while signed out in a normal browser; this environment encountered Google's traffic-verification page |
| Private registration evidence | blocked | 07-registration/private-checklist.md | Confirm and attach the applicable CAC certificate or valid ID privately; the checklist is not registration evidence |
| Representative mobile/network and assistive verification | blocked | evidence/production-review.json | Record actual device/network conditions and measured results |

English is the current language scope. Official API and fine-tuning checkboxes
remain unselected. Browser readout and Microsoft demo narration are distinct
from N-ATLaS ASR and text inference. SecretVM hosts model inference; Sites handles
plaintext application requests before forwarding over HTTPS, so the application
does not claim end-to-end confidential processing.

Official requirements: https://ncair.nitda.gov.ng/naic/
The published deadline is 12 October 2026, 23:59 WAT.
'''
(ROOT/'submission/MANIFEST.md').write_text(manifest, encoding='utf-8')
(ROOT/'submission/RELEASE-GATE.md').write_text(gate, encoding='utf-8')
video = ROOT/'submission/05-video/README.md'
text = video.read_text(encoding='utf-8')
text = text.replace('# PauseAm demo edit — owner review', '# PauseAm video demonstration')
text = text.replace("## Review files on the owner's PC", '## Video files')
text = text.replace('Generated review media', 'Generated media')
start = text.find('After approval, upload the MP4')
if start >= 0:
    end = text.index('## Reproduce the edit', start)
    text = text[:start] + 'Video URL supplied in ONDI: https://youtu.be/Q-CDzLg24J0\n\nOn 3 October, a fresh browser check encountered Google\'s traffic-verification\npage. Check this exact URL while signed out in a normal browser before submitting.\n\n' + text[end:]
video.write_text(text, encoding='utf-8')
matrix = '''# Six-criterion evidence matrix

PauseAm | English voice and text | 3 October 2026

| Criterion | Current evidence | Further evidence |
|---|---|---|
| Working Artefact & Technical Rigour | Public app and repository; version 25; 80 application tests, type checking, production build and ten live backend checks | Representative Android/network and assistive results |
| N-ATLaS Integration | Official pinned English ASR and text weights; six authenticated VM text requests and four public text-model requests; transcript correction and grounded guidance | Organiser confirmation of self-hosted ASR-service qualification; participant speech accuracy |
| Real-World Validation | Thirty testers; consented feedback form, observed-session protocol and anonymous evaluation export | Fifty documented real user interactions; feedback analysis, defects and retests |
| Impact Potential | Payment checking, bank-first reporting and verified information for students, everyday users and small businesses; 200+ willing volunteer pool | Observed comprehension, useful completion and return use; 1,000 users in three months is the post-award acquisition target |
| Scalability & Sustainability | 16 GB CPU host; supplied price $0.24/hour; persistent licence guard; source-review workflow; free guidance with proposed paid human recovery-case support | Measured cost and demand; legal-partner fee review and secure case intake; commercial model licensing and permission before exceeding the rolling 1,000-user cap |
| Team Capability | Kayode Popoola: product, content, partnerships and research; Suleiman: technical lead, application engineering, model hosting and testing | Maintain clear ownership as operation and validation expand |

Current records: [manifest](MANIFEST.md), [release checks](RELEASE-GATE.md),
[integration report](02-integration/integration-current.md),
[user testing](03-validation/validation-report.md) and
[technical documentation](04-technical/technical-current.md).
'''
(ROOT/'submission/evidence-matrix.md').write_text(matrix, encoding='utf-8')
print('Reconciled current manifest, release checks and supplied video URL.')
