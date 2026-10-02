# Consumer reporting and learning release — 2 October 2026

This release removes model IDs, API configuration, review-date notes, provenance accordions and research navigation from everyday consumer screens. Source records, model identity checks and evaluation tools remain in the backend, repository and separate evaluation route. Research measurements require a separate opt-in on that route; ordinary questions are not saved as research records.

## Delivered behavior

- Describe a payment concern in English by text or the existing consented voice/transcript-correction path.
- Prepare a bank report or CBN escalation draft after explaining what happened. The draft preserves the user's description and adds no transaction facts. Users can review it, copy it or start a text download on request. It is not sent by PauseAm. The in-app browser showed the download confirmation, but the downloaded file could not be retrieved for verification; successful file saving is not claimed by that check.
- Bank-first, waiting, missing acknowledgment/reference after three days, and overdue-resolution choices. These are user-reported stages, not an automated eligibility determination. Resolution timelines differ by complaint.
- Mistaken transfers and potential account-security incidents receive specific source-backed next steps. No recovery promise, account authentication or malware verdict.
- Learn: three dated ngCERT advisory summaries, protective steps, and a two-choice practice interaction. The notice dates are 27 August, 13 July and 15 June 2026. These are selected notices, not a claim to cover the latest incidents or a live news feed.

## Source provenance and maintenance

- CBN complaint guide: https://www.cbn.gov.ng/Out/2022/CCD/CBN%20How%20to%20Lodge%20a%20Complaint.pdf — official search-index content records bank-first reporting, escalation after missing acknowledgment/reference within three days or expiration of applicable resolution times, and cpd@cbn.gov.ng.
- CBN source directory: https://www.cbn.gov.ng/FinInc/FinLit/LodgeComplaint.html
- CBN protective guidance: https://www.cbn.gov.ng/supervision/cpdfraudandscam.html
- ngCERT official listings: https://cert.gov.ng/index.php and https://cert.gov.ng/

On 2 October, direct page/PDF retrieval returned HTTP 403, and advanced extraction returned no content. Advisory summaries and publication dates were checked against official-domain search-index content; successful direct retrieval is not claimed. Full independent human safety review remains pending. Advisory mitigations use the official notice summary and/or CBN protective guidance, as recorded in `lib/updates.ts`.

The advisory catalog is manually maintained in `lib/updates.ts`, served by `GET /api/learn`, and withdrawn after 9 October unless actually reviewed and updated. Do not change review dates without rechecking sources. Source allowlisting, future-date rejection and expiry filtering run server-side. Complaint escalation metadata expires on 1 November; expired guidance falls back to contacting the bank and cannot authorize escalation.

Before refreshing the catalog: check the official publisher, record the actual publication date and canonical URL, write a brief accurate summary and practical steps, seek human review, run tests, and publish the reviewed code. The UI fetches the current catalog when Learn opens; it does not fetch arbitrary websites or generate news with a model. No notification subscriptions or background outreach are enabled.

## Validation scope

Engineering checks and browser verification are recorded separately from live-user validation. This release is not evidence of completed participant interactions, improved ASR accuracy, official N-ATLaS API use, fine-tuning or working generative text inference. English ASR identity checks and existing server-side configuration remain unchanged.

Relevant implementation: `components/report-guide.tsx`, `lib/reporting.ts`, `components/learning-updates.tsx`, `lib/updates.ts`, `app/api/learn/route.ts`, `lib/safety.ts`, `tests/reporting.test.ts`.

Reproduce public feature checks with `node scripts/verify-reporting-learning.mjs`; the default output is an ignored private engineering trace. The selected learning catalog is expected to be withheld after its review expiry, so a subsequent failed catalog check then indicates that an actual content review is due, not a reason to fabricate new dates.
