# Contextual guidance correction

The owner asked for less generic replies that respond to stated circumstances
and give useful detail. Previously N-ATLaS selected one exact library card and
the consumer interface repeated that card's fixed checklist.

`lib/guidance.ts` now adds checked scenario explanations only after an eligible
source card is returned successfully. It recognises explicitly mentioned payment
pressure, independent supplier confirmation, missing credits/deductions and an
existing bank complaint. It preserves the card, source, model ID/revision and
real inference path. These are authored source-derived scenarios; they are not
free-form N-ATLaS output, a claim to understand every question, or fine-tuning.

Explanations do not copy raw messages, amount/date values or identifiers. An
expired or altered card, unavailable inference, bank-directory answer or privacy
rejection cannot acquire contextual safety advice. A vague payment concern asks
for context. Choosing a follow-up amends the visible question and requires the
user to review/send; it does not save a conversation. The reporting form uses a
waiting stage only for an explicitly stated report to the bank, never from a
payment date or passage of time. The user can correct that stage.

CBN fraud awareness and bank customers' duties were fetched and checked on
3 October 2026. The complaint PDF returned HTTP 403 on this recheck; existing
source-checked complaint rules are unchanged and independent review remains
pending. No new escalation period, recovery promise, bank contact or authenticity
verdict was introduced. New wording applies the established primary-source facts:

- https://www.cbn.gov.ng/supervision/cpdfraudandscam.html
- https://www.cbn.gov.ng/FinInc/FinLit/BillOfRights.html
- https://www.cbn.gov.ng/FinInc/FinLit/LodgeComplaint.html

Six new regression tests cover circumstance-sensitive wording, reported versus
planned complaints, vague context/follow-up routing, source and privacy guards,
and the absence of fraud/recovery assertions. Authored test questions are not
human validation. A restricted-shell Worker test encountered filesystem access
denial; repeat using the authorized build environment before claiming it passed.
The local dev runner returned an internal error before exposing a preview. The
production build/Worker must be checked separately; no preview success is claimed.

Independent human safety review and representative usability remain pending.

The authorized production build passed 71 tests and typecheck. Its local Worker
rendered HTTP 200 and the actual browser showed the supplier explanation, changed
wording after independent-confirmation input, vague-question clarification and
the correct default waiting stage for an existing complaint. Local model endpoints
were not configured; these checks prove rendering and scenario behavior, not live
inference. The browser also exposed a remaining generic "Start with your bank"
subheading for the waiting stage; that label is corrected and regression-checked
before final publication. The failed development runner is superseded by this
successful production Worker preview, not described as a successful dev preview.

A genuine request against version 22 for "I need help with a payment" returned
HTTP 200/no_match from the pinned N-ATLaS model. The correction asks a clarification
before assessment when the only retrieved match is a general payment topic. It
returns no cards or safety advice and claims no model inference for that question.
After the person adds context and sends again, normal source/model checks resume.

Version 23 passed all ten genuine public checks. Its live browser showed a vague
question becoming a missing-transfer explanation after the person chose a
follow-up and sent the amended question. Expanded details fitted 320/390-pixel
emulated widths without horizontal overflow. That check also showed that the
missing-credit detail belonged in the main action, not only the expansion.
The final correction names the debit/missing credit or deduction in the initial
investigation request and carries those actions into the first reporting stage.
The version-23 evidence remains in contextual-replies-live-2026-10-03.json.

Final version 24 passed all 71 tests, typecheck, production build and 10/10 actual
public checks, including four genuine pinned N-ATLaS requests. The final live
browser follow-up produced the specific debit/missing-credit main actions, which
fit an emulated 320-pixel width without overflow. Viewport overrides were reset.
Release identity, limits and screenshot are recorded in
contextual-replies-release-2026-10-03.json and contextual-answer-live-v24-2026-10-03.jpg.
There is no new human-interaction count, speech-accuracy proof or actual OpenAI
speech use in these checks. No SecretVM update is required.
No research interactions are added. The requested automatic voice replies await
the owner's provider decision. Browser Listen is not GPT speech; no OpenAI key
has been created or used. No SecretVM/model container update is needed for the
contextual-reply website change.
