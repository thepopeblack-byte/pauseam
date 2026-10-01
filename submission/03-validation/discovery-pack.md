# PauseAm discovery and validation pack

Ask before you pay. Prepared 1 October 2026. **No sessions have been recorded.**

Kayode will arrange participants; no invitations have been sent by the build agent.
The 200+ willing people are a prospective pool, not users or completed interactions.

## First: 6–8 discovery sessions, 15 minutes each

Include students, everyday users and small-business operators. Seek a mix of
Nigerian-accented English, Yoruba, Hausa and Igbo speakers, device confidence and
connectivity. Adults only for this pilot. Do not record children or real secrets.

Read this consent script before taking notes:

“We are testing an unfinished payment-guidance tool called PauseAm. Participation
is voluntary. You may skip anything or stop without consequence. Please do not
share names, account details, passwords, PINs, OTPs, private messages or real
transaction records. With your permission we will record a random participant code,
language, device/network category, task outcomes and redacted feedback. We will not
record raw audio or video by default. Anonymous totals may be included in our
challenge submission. You can request deletion using your participant code until
we aggregate the results. May we take these limited notes?”

Record yes/no, consent version PA-2026-10-01, date and observer code. No means stop
research logging; the person may still use general guidance. Keep any scheduling
contact list separate, access restricted to the team. Never put it in Git.

Minutes 0–2: consent and context. Minutes 2–9: ask without suggesting answers:

1. Tell me about the last payment decision you were unsure about, without private details.
2. What information did you have? What was missing?
3. What did you do next, and why?
4. Where did you expect to get help? What happened when you tried?
5. In that moment, would you have spoken to a tool? Where would you be, and who might overhear?
6. What do you think “PauseAm” does? How would you describe it to a friend?

Minutes 9–13: show the actual three actions. Ask which fits the story, what they
expect after tapping it and whether a short checklist would change their next step.
Do not call the product useful before they respond. Minutes 13–15: priorities,
unanswered questions, thanks. No financial incentives are assumed or offered.

## Decision record after discovery

For each finding record the participant codes, exact redacted observation, count
within this small sample, interpretation and resulting change. Keep observations
separate from assumptions. Record contradictions. Do not generalise percentages
from 6–8 interviews to Nigeria. Current hypothesis: a short decision companion is
more useful than a general fraud chatbot. Status: **untested**.

Enable small-business mode only if multiple business participants describe a real
supplier-change/approval problem and can use the proposed callback checklist.
Keep screenshot input off until a privacy and reliability test justifies it.
Keep the name provisional until participants can explain it; this is not a legal
or domain-clearance exercise.

## Observed usability round

Use synthetic situations, never a person's actual credentials. These are test
tasks, not fabricated results. Rotate tasks to avoid coaching and learning effects.

- A supplier sends changed bank details in a message. Explain the situation by voice.
- Correct a deliberate misunderstanding in the transcript before sending it.
- A forwarded school-fee instruction asks for urgent payment. Find a next step.
- You already sent money and suspect impersonation. Find the first action.
- Someone sent a receipt image. Explain what the app can and cannot establish.
- Find the source and review date. Explain the advice in your own words.
- Try a warning-sign lesson and describe why you chose your answer.

Ask a fluent speaker to create equivalent task prompts in each language and sign
off meaning, tone and critical safety terms before using those translations.
Log noise and code-switching as separate conditions, never as proven support.
Do not count a typed-only fallback as a successful PS2 voice interaction.

## Predeclared final-round criteria (targets, not results)

- At least 50 completed, documented PS2 voice interactions, with consent and a
  real official-model request trace. Report distinct people and repeat interactions.
- Target at least 10 completed interactions per language; report actual imbalance.
- At least 80% complete voice → correction → checklist without task help.
- At least 90% identify the independent-verification action correctly.
- At least 80% locate source and review date without help within 30 seconds.
- Zero critical harmful advice, leaked secret, false “safe” verdict or invented contact.
- Report WER only against consented human reference transcripts with fluent review.
  Report correction frequency separately; no confidence score is supplied by ASR.
- Report median and p95 ASR and answer latency; never merge them with page INP.
- Page targets: LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 under recorded conditions.

Record failures, dropouts and unavailable endpoints. Do not remove them to improve
success rates. Freeze a build/version for the final round, then publish fixes and
any retest separately. A gate failure stays a failure even if submission is near.

## Evidence and retention

Use the empty CSV header in this folder. Keep completed logs in `private/research/`
(Git-ignored), encrypted at rest using a team-controlled drive. The observer must
attest real completion and link the build/trace ID. Participant IDs are random;
do not derive them from phone numbers or names. Restrict raw logs to Kayode and
Suleiman; publish only reviewed redacted aggregates. Proposed retention: delete
raw pilot logs within 90 days of collection; confirm this in participant consent.
No research data is silently collected by the product. Device-local feedback is
not, on its own, independently documented human validation.

Current results: discovery 0; documented PS2 interactions 0; fluent sign-offs 0.
