# Sites hosting and public-app checks — 2 October 2026

This is engineering verification, not participant validation. No research
consent was enabled and no participant record was created.

## Actual hosting inspection

The existing Sites project is active, public and owned by the signed-in user.
Production runtime revision 1 contains KB_ENABLED=true and ASR_ENABLED=false;
neither ASR endpoints nor a text endpoint/service credential is configured.
No secrets were printed. Before this change, no custom domains were attached.
Registering pauseam.theblockcapitol.com succeeded. The user saved Namecheap
records in their other browser. A subsequent Sites refresh returned domain,
provider and SSL statuses active at 04:24:19 UTC. A fresh browser and 15 actual
API checks through the custom origin passed at 04:26:02 UTC. The user's screenshot
also confirms the saved pauseam CNAME. Root/www records were left alone.

The current app source uses a Cloudflare Worker. Its runtime cannot load the
Python/PyTorch NCAIR model containers. The supplied Hugging Face bucket is a file
store, not an HTTPS transcription/guide service. No provider is inferred from a
bucket URL, and no paid service was launched during this hosting change.

## Real API checks

The existing 15-check HTTP script passed against the public app. The new
scripts/verify-public-app.mjs also performed 15 real baseline checks with source
and step equality, privacy rejection, same-origin protection, upload-consent
requirements and safe refusal of unconfigured languages. All passed. The
--require-models gate intentionally exited 1 because no models are connected.
The complete result with actual request times is in
sites-public-app-2026-10-02.json. Request times are server HTTP timings on this
Windows connection, not Web Vitals, field performance or model latency.

## Visible product checks

A newly opened in-app browser page showed the three journeys without sign-up.
The authored supplier-bank-change prompt returned an independent-callback
checklist. Its expanded source view showed the CBN link, 1 October check date,
1 November review deadline and pending independent human review. The answer
engine explicitly said source keyword retrieval, answer model none, speech model
none. Voice became unavailable with the typed path still accessible.

The after-payment journey prominently showed immediate bank contact and the
CBN source without waiting for a model. It showed an in-memory incident timeline,
evidence checklist and download action; these controls are not a bank integration.
The learning banking-code prompt returned the secrets checklist and a practical
caller-pressure question with two choices. This review is not evidence of human
comprehension or four-language usability.
Selecting independent bank contact displayed the expected explanation and CBN
link, explicitly labelled static practice feedback with no model used.

## Remaining gate

DNS/TLS are verified. All four new ASR buckets match the complete required file
sets and full weights. Connect a genuine inference host; retest the final text decoder; exercise
consented real speech in all four languages through the public app; have fluent
reviewers correct transcripts and check critical wording; test real mobile and
constrained networks. Only then start the required genuine validation sessions
and record the operating-product demo. Official N-ATLaS service/API qualification
remains unverified and must not be claimed.

## CPU package preparation

The user selected Hugging Face CPU preparation. The five-file Docker Space ZIP
contains code/configuration only; no weights, credentials or recordings. A
private local runtime file was prepared without printing its values. An
authenticated read-only HEAD request to the exact pinned official text config
returned HTTP 200, with redirects disabled. No inference or weights download
was performed by that probe. Existing approval therefore reaches that file.

Thirty-nine Node checks passed, including actual SQLite quota insertion/expiry
and service authentication. Eighteen model/audio Python checks and eight new
gateway-boundary checks passed. TypeScript passed after correcting one test
type. Fixtures are engineering tests only and create no participant evidence.
The public-candidate scan checked 277 files against six known private values
and found zero exact token leaks. This is not a complete security audit.
The combined Docker runtime requires the GitHub CI build/import gate because
the local Linux Docker engine is unavailable. No paid Space was launched and
private Sites quota configuration remains pending; model switches stay off.
