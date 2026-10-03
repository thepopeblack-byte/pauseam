# User testing and validation

PauseAm | English voice and text | 3 October 2026

## User testing
Thirty people have tested PauseAm. We are collecting feedback on the journeys they used, voice or text input, device and network conditions, transcription corrections, useful next steps and any errors. A wider pool of more than 200 volunteers is available for further testing.

## Feedback collection
The questionnaire asks what users tried, what happened, what failed, what was helpful or confusing, what they would do next and whether the English voice journey completed. Participation is voluntary. The form collects no names, email addresses or tester codes. Responses remain in the team's Google Forms account and individual feedback is retained for up to 90 days.

Feedback form: https://docs.google.com/forms/d/e/1FAIpQLSehR9XnB63y54J02_NkrXsf59o8CLlbrBEDGRdPyAFyiHrFcg/viewform?usp=header

## Evaluation method
We evaluate the complete voice flow: recording, transcription, correction and confirmation, then usable guidance. Typed-only tests, incomplete attempts and assisted completions are recorded separately. Follow-up questions assess whether users understand the recommended action and can find the bank-first reporting journey.

The observed-session protocol records consent, device/network conditions, the journey, transcript corrections, completion, comprehension, defects and retests. Anonymous app exports provide model identities, request references and timing. Team records are checked with scripts/validate-research.py before aggregation. Response, participant and completed-interaction counts are recorded separately.

The next round targets 50 documented completed English voice interactions, 80% unassisted completion, 90% correct next-action comprehension and 80% unassisted bank-first reporting navigation.

## Current findings
Participant feedback is being collected and has not yet been analysed. Completion rates, comprehension scores and speech accuracy will be calculated from the reviewed evidence.

Development testing identified problems with free-form voice questions containing amounts or dates, combined bank email/phone requests and generic next-step wording. These led to input-handling fixes, combined contact answers, contextual explanations and clarifying questions. Replay/stop controls and the report download were checked in the operating product.

## Engineering results
The current release passed 80 application tests, type checking, the production build and ten public backend checks. Four backend checks used the pinned N-ATLaS text model and completed in 5,960-7,803 ms. These measurements describe engineering verification, separate from participant feedback.

Logs: https://github.com/thepopeblack-byte/pauseam/blob/main/submission/evidence/spoken-replies-live-2026-10-03.json
