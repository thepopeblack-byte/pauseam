# PauseAm: weekend testing for the Monday review

Target review/submission date: Monday, 5 October 2026. Official deadline: 12 October, 11:59 p.m. WAT. Kayode submits only after reviewing the evidence. Nothing has been submitted.

## Before inviting the wider group

Suleiman and Kayode must first complete a real English recording, listen to it, obtain a transcript, correct it and receive guidance on the published build. Test a typed supplier-change question, report copy/download in a normal browser, and a Learn example. A functioning microphone and a health check alone are insufficient.

The current agreed language scope is English. Yoruba, Hausa and Igbo are deferred; do not record them as delivered. Use the current release commit in every observer log. Do not change builds during the final validation round without recording the change and separate retest.

## First 6-8 sessions: listen and improve

Include students, everyday users and business operators, with a mix of phone confidence and connectivity. Ask about a recent difficult payment decision, what information they had, what they did, where they expected help, and whether voice would have helped. Ask what PauseAm means to them. Never request real transaction details. Record redacted findings, contradictions and resulting changes; these interviews are not automatically completed voice interactions.

## Consent: read before logging

"We are testing PauseAm, an unfinished payment-guidance tool. Taking part is voluntary; you can skip a task or stop. Please do not share names, numbers, PINs, OTPs, passwords or actual transaction records. If you agree, we will record a random code, date, device/network category, task results and coded feedback. Voice recording requires separate permission in the app, and audio/transcripts are not retained by default. Anonymous totals may appear in our challenge submission. You can request deletion using your code before we aggregate the results. The team will delete individual session logs within 90 days. May we record these limited results?"

If no: do not create a research row. If yes: record consent version PA-2026-10-01 and the actual date/time. Publishing someone's voice/video requires separate explicit permission.

## An 8-10 minute observed session

1. Open https://pauseam.theblockcapitol.com on the participant's usual device. Record device category and actual connection, including poor signal/noise. Do not coach the navigation.
2. Ask them to describe one safe fictional situation by English voice: changed supplier bank details, forwarded school-fee instructions, a buyer's receipt, or an urgent request for a banking code. Obtain a real transcript, let them correct it and confirm it, then request next steps. Record failures as failures. Never count typed-only fallback as a completed voice interaction.
3. Ask: "What will you do next, and why?" Record whether they independently identify the appropriate trusted verification action. Do not mark success merely because a screen appeared.
4. Ask them to find help after a suspected payment scam and prepare a report. Check whether they understand that the bank is contacted first, the draft is not automatically sent, and recovery is not guaranteed.
5. Try one learning example. Ask which action they would take and whether the explanation makes sense.
6. Ask what confused them and whether they would use PauseAm for that situation. Code feedback; keep redacted observations separately. Record defects, the fix and any retest.

## Record evidence with minimal effort

3 October feedback collection: the owner reports 25 testers have tried the app.
Use the [published Google feedback form and privacy instructions](feedback-form-content.txt)
for consented self-reports. Feedback, an attempted session and a documented
completed voice interaction remain different records. Reconcile actual outcomes
and supporting evidence before updating totals; do not invent retrospective consent.
The form was simplified at the owner's request: no tester-code field. Its
responses alone cannot establish distinct participants or deduplicate retests.
Any observer IDs below belong to the separate private research log, not the
tester questionnaire.

For consented measurements, open https://pauseam.theblockcapitol.com/evaluation. The research checkbox is off until the participant agrees. Run the voice test and question flow there, then export the actual anonymous measurements. Exports contain only whitelisted outcomes, timing, model identity and request references where returned. They remain editable device-local evidence, not proof of participant authenticity.

Keep the observer CSV in the ignored private/research folder using interactions-template.csv as the header. Use a random P- plus 12 lowercase hex participant code; never derive it from a name or phone number. Record the actual build commit, returned model/revision, request reference, consent and observed outcomes. The observer must attest a real session. Request references identify responses; they are not signed research attestations. Never fill technical fields with guessed values. If unknown, record the issue and resolve it before counting the session.

The app's prompted ASR test can measure word errors against its displayed reference sentence. Correction frequency in an open question is a separate measure; do not calculate WER without a consented reference transcript and review.

## Targets declared before this final round

- At least 50 documented completed English voice interactions; report distinct participants, repeat interactions, attempts, failures and dropouts separately.
- At least 80% complete recording -> correction/confirmation -> guidance without assistance.
- At least 90% correctly explain the next independent-verification action.
- At least 80% find the bank-first report path without assistance.
- Zero leaked secret, invented contact, false safe verdict or recovery promise. Stop testing and fix any critical harmful defect.
- Report median and p95 ASR and guidance latency separately from page performance. Include device/network conditions and limitations.

These English-scope targets replace the earlier four-language final-round targets before any new participant data has been received. The earlier protocol remains in discovery-pack.md as historical planning, not completed evidence. Consumer source/model detail navigation was deliberately removed at Kayode's request; audit provenance through the evidence package instead of pretending participants can find a removed control.

For the current round, use `source_found_unassisted=n/a` because that consumer
control was removed. Record the observed report-navigation result as yes/no in
`bank_first_found_unassisted`. `voice_completed=yes` means the actual recording,
transcript confirmation and usable guidance all completed, not merely that the
microphone started or a transcript appeared. Failed attempts must remain in the
log with `voice_completed=no`. Dates need timezone offsets, with consent before
the session. Copy the returned ASR request reference and exact model revision.

## Reconcile results

Run `python scripts/validate-research.py private/research/interactions.csv --output private/research/totals.json`. This checks consistency, not truth. Kayode and Suleiman review the rows against observed sessions and anonymous exports. Publish redacted totals and limitations only; raw logs, contacts, IDs and recordings stay private. At preparation time, completed documented interactions remain zero. Do not create 50 result rows in advance or omit failures.
