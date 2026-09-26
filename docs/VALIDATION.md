# Observed validation — 2026-09-26

- Core software tests: 23 passed; these include deliberately mocked upstream contracts and synthetic negative inputs, not model output or participant data.
- TypeScript: passed.
- Production Worker build: passed.
- Live local HTTP checks: 12 passed (routes, cited typed answer, unknown question, sensitive-input rejection, urgent route, origin enforcement, size limits and consent/content-type failures). They do not write evaluation records.
- Python inference service: syntax parsed successfully. Python dependencies/model loading/inference were NOT run in this environment.
- Browser: typed seller question returned source-linked guidance with review caveat and no answer model; after-payment tab showed immediate bank-contact guidance. Agent question staging was verified with valid input and empty-input rejection.
- Responsive browser check: a requested 390px viewport override rendered the mobile layout without horizontal content overflow; the embedded browser reported innerWidth 433 and document width 416, so exact physical-pixel dimensions were not assumed.
- Live NCAIR inference: NOT validated. User confirms approved access and an inference host; endpoint URL/contract and securely configured token still required.
- Independent human source review: pending.
- Participant/field trials: none claimed. Dashboard contains no seeded validation data.

This file reports only observed checks. It is not a financial-safety certification or model benchmark.
