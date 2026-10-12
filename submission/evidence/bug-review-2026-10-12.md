# PauseAm bug review — 12 October 2026

## Corrections

- An ordinary use of the verb “access” could select Access Bank when the user
  had not named their bank. The lookup now asks for clarification in those
  cases and still accepts an explicit Access Bank name.
- The voice-request deadline ended when HTTP headers arrived. It now covers
  reading and parsing the full bounded response. Timeout and unreadable-response
  messages are understandable, and cancellation still discards late results.
- A recorder error could leave the voice interface busy. The failure path now
  clears that state. Example buttons cannot interrupt an active voice operation.
- A transcript longer than the answer endpoint's 600-character limit could
  produce a generic error. The interface now shows its length and asks the user
  to shorten it before submission, without silently truncating the recording.
- A statement about not reporting to the police could erase a separate explicit
  statement about contacting the bank. Reporting-state recognition now evaluates
  the bank statements separately.
- The incident-summary download used a detached link and an early URL cleanup.
  It now uses the same mobile download helper as the report export, provides an
  error message, and reads its complaint URL/date from the maintained source.
- The learning notices expired on 9 October. Official indexed source content was
  rechecked, notice links improved and the next review set for 19 October. See
  `content-recheck-2026-10-12.md` for retrieval limits and provenance.
- The HTTP smoke script incorrectly assumed the text model was disabled. It now
  checks the configured model's actual identity and reports model responses
  honestly instead of claiming that no inference occurred.

## Engineering checks

89 JavaScript tests passed, including new response-body timeout, cancellation,
bank-name ambiguity and reporting-state regressions. 32 Python tests passed.
TypeScript checking passed. The transport test required permission to connect to
local loopback; it passed with that access. The learning-source update's affected
25 JavaScript tests were rerun and passed.

At a 360 × 800 browser viewport, the corrected bank clarification rendered without
horizontal overflow. This is a responsive-layout check, not a physical Android
device or constrained-network performance measurement.

The deployment recovery profile preserves existing encrypted-secret references
and named volumes. The active host reported `payment-context-v2` and the official
English ASR revision. The website's N-ATLaS text request with an ordinary amount
and date passed after model startup. No ASR model image change is required for
the website fixes in this review.

Engineering checks and authored smoke requests are separate from participant
validation. No tester results, human speech accuracy, recovery outcome or
submission eligibility are inferred from these checks.
