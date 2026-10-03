# PauseAm working artefact

Ask before you pay. Innovation & Enterprise / PS2 Voice-First Access.
Review build, 3 October 2026. Not submission-ready.

Repository: https://github.com/thepopeblack-byte/pauseam
Site: https://pauseam.theblockcapitol.com (active HTTPS)
Public access and deployed-commit checks are recorded separately in the release gate.

## Run locally
Use Node 22.13+ and the committed npm lockfile. Run npm ci --no-audit --no-fund,
then npm run dev. Open http://localhost:5173/.
For production: npm run build, then npm run start. Wrangler prints the local URL.
Check /api/status and run npm run test:http with BASE_URL set to that origin.

## Stable demonstration
In Ask a question, choose Type, enter your own non-sensitive payment concern or the optional supplier example and choose Send question. The reply stays silent. Follow-up choices amend the question for review before sending. Expand More about your situation for detail and Source and limits for the primary source.
For voice, choose Speak; consent, record, listen, transcribe, correct, confirm
and send. Hear the reply with text below; use Replay reply and Stop. Readout
uses a local English device voice; N-ATLaS supplies recognition and model-backed
relevance. The owner confirms these controls and silent text work. This is not
an N-ATLaS TTS claim or representative participant validation. Choose Report a problem
for immediate bank-first instructions and a private report draft; preview, copy
or download it yourself. Choose Learn and answer a warning-sign question.
Technical provenance lives in /api/status, /evaluation and submission evidence;
ordinary consumers do not need an invented source-detail control.

Voice requires a genuine configured host. Do not narrate typed guidance as ASR.
Genuine CPU model requests are recorded in ../evidence/live-text-inference-2026-10-02.json.
Public checks passed 20/21; vague changed-details wording safely abstained.
No completed participant-validation claim is supported. Evaluation starts empty.
