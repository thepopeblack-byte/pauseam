# Engineering review — 1 October 2026

These checks were performed by Codex on the Windows development host. They are
engineering evidence, not field validation, fluent-language review or model proof.

- 35 Node safety, retrieval, privacy, model-contract and audio-boundary tests passed.
- 6 Python WAV-validation tests passed.
- TypeScript checking and Python syntax compilation passed.
- 15 live local HTTP checks passed, including unavailable inference, origin/consent
  checks and safe failure for unconfigured Yoruba, Hausa and Igbo guidance.
- Responsive UI inspected at a 390 × 844 browser viewport on the Windows host.
  This is not a physical Android test or a throttled-network measurement.
- Before-payment supplier-change guidance and its source detail opened correctly.
- Urgent bank-contact guidance appeared immediately in the after-payment journey.
- Incident date entry initially failed during browser testing. Replaced its input
  handler; a selected payment-request event then appeared in the timeline.
- A real downloaded incident text file was inspected. It contained only the
  selected event, evidence checklist, official source and limitations. The fixture
  event date was 25 September 2026; it was not a reported real incident.
- Learning question accepted a keyboard answer, explained it and disabled repeat
  answers. No score, streak or claim of field success was added.
- Five PDF review documents were rendered to final rendered pages. Every rendered page was
  visually inspected; headings, margins and body text were legible without clipping.

No model inference request succeeded. No recorded user interaction, human safety
review, language review, TalkBack/NVDA test, physical low-end Android test or MP4
was produced by these checks. Production checks are recorded separately.

Final live release check caught and repaired Unicode punctuation encoding and a rapid first-use click before controls were ready. Corrected source 741796df32aeede3d9180a7cf0123fc219ad60bf was rebuilt, deployed and checked. The selected question then persisted, a visible loading state appeared and real source guidance returned. See production-review.json for measured failures and limits.

Evaluation schema 2 now keeps per-language ASR provenance and rejects wrong language/model pairings. Two additional engineering tests passed; none are participant records. A clean public clone of commit 741796df32aeede3d9180a7cf0123fc219ad60bf installed 671 locked packages and passed TypeScript checking. New npm reported six pending build-install scripts; only their exact official dependency versions were approved. Fresh clone dependency rebuild and production build also passed; model deployment remains unverified.
