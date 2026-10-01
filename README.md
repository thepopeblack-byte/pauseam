# Before You Pay

Mobile-first NCAIR National AI Innovation Challenge / Voice-First Access research MVP.

**Implemented:** before-payment, suspected-fraud and learning journeys; genuine NCAIR ASR adapter plus Python inference service; transcript confirmation; versioned CBN source-linked retrieval; explicit consent; local anonymous evaluation; safe failures; tests.

**Not claimed:** live model inference, human expert approval, participant validation, accent accuracy, bank integration, fraud detection or recovery. Voice is disabled until the operator obtains gated access and configures a service. See [review register](docs/REVIEW.md) and [validation record](docs/VALIDATION.md).

## Reproduce the web app

Node 22.18+ (tested on 24.18), npm and Git. From this directory:

```sh
npm ci
npm test
npm run typecheck
npm run dev
```

Open the printed local address (default http://localhost:5173). Run `npm run build` for the Cloudflare Worker and browser assets. `npm start` serves the built Worker locally. This uses React, Vinext/Vite and the bundled Sites build plugin; preserve `sites()` in vite.config.ts.

If npm's Windows shim fails, run its installed JS entrypoint directly:
`node "C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js" ci`.
This is an environment workaround, not a requirement for other systems.

No model credentials are needed for typed guidance. Default inference is **off**, never mocked. No analytics service, database or chat-history storage.

## Configuration

Copy `config.env.example` to an ignored `.dev.vars` for local Cloudflare development; set only the WEB values there. The same web keys are documented in `.env.example`. Never put HF_TOKEN in the web runtime or any NEXT_PUBLIC variable. Restart local preview after changing variables.

| Web setting | Default | Meaning |
| --- | --- | --- |
| ASR_ENABLED | false | Must be the literal true to enable voice |
| ASR_ENDPOINT | empty | Your HTTPS inference URL ending in /transcribe |
| ASR_SERVICE_TOKEN | empty | Server-side bearer secret shared with inference service |
| KB_ENABLED | true | Set false to fail retrieval closed |

The service uses HF_TOKEN, ASR_SERVICE_TOKEN and MODEL_REVISION. Obtain access to [the official gated model](https://huggingface.co/NCAIR1/NigerianAccentedEnglish) with your own account and review its research/innovation licence. Commercial deployment requires checking its additional terms. Do not assume a Hugging Face serverless inference provider serves this model.

## Real model integration

Pinned model: NCAIR1/NigerianAccentedEnglish.
Pinned revision: 3c52c6e6c9ec508014a7b9db6a42b503b8930dff.

Browser recording → consented playback check → mono PCM16 WAV at 16 kHz → same-origin Worker /api/asr → authenticated HTTPS Python /transcribe → actual Transformers pipeline → provenance check → editable transcript → user confirmation → source retrieval.

Python service setup (Python 3.11):

```sh
python -m venv .venv
# Activate .venv using your platform's normal command.
python -m pip install -r asr/requirements.txt
# Set HF_TOKEN and ASR_SERVICE_TOKEN using your host's secret manager.
# Set MODEL_REVISION to the exact revision above.
python -m uvicorn asr.app:app --host 127.0.0.1 --port 8000 --no-access-log --log-level warning
```

Or build `docker build -t before-you-pay-asr ./asr` and run on a Python/container host behind HTTPS. Use secret injection, not literal tokens in command history. CPU inference is supported but may exceed the 45-second deadline; choose an appropriately sized CPU/GPU host and measure it. Do not try to load PyTorch weights inside a Cloudflare Worker.

The service fails startup when credentials, revision or model loading fail. It loads only the pinned NCAIR model using safetensors and no remote code. /health requires its bearer secret and returns the loaded model/revision. /transcribe accepts audio/wav, at most 30 seconds; the UI stops at 28 seconds. It bounds bytes, checks format and silence, serializes inference and caps attempts at 30/minute per service process. Scale limits must be enforced at the host if running multiple processes.

The service discards raw audio and transcripts after processing and does not log payloads. In-memory processing is unavoidable. Secret-pattern detection is imperfect: never speak private details. An operator must disable payload logging, tracing capture and backups at proxies and hosts too.

Opt-in real connectivity check, using a genuinely consented safe WAV:
`node scripts/live-smoke.mjs /path/to/sample.wav`.
It reports only whether the expected model returned text, not a transcript or an accuracy score.

## Sources and answer policy

`lib/safety.ts` contains six narrow source-checked cards, each with URL, source section, review date, expiry and honest review status. Answers are deterministic retrieval, not generated advice. Every result identifies the answer engine, source, library version and speech model (or typed input). Sources are reviewed snapshots, not fetched per question. Human expert sign-off remains pending and must be recorded by an actual reviewer. Cards expire on 2026-12-26 and then fail closed.

No payment authorization, recipient lookup, bank account integration or reporting submission. No guarantee of refund. Unknown questions abstain. Expired/disabled/missing retrieval, unavailable ASR and malformed/wrong-model responses produce no invented result.

## Evaluation

`/evaluation` starts with zero records and “Not measured”. Consent is off by default and separate from microphone consent. Records stay in this browser, maximum 500; no identifiers, names, demographics, audio, text or credentials. Export and deletion are explicit actions.

Measures: saved trial count (not participant count), ASR success/attempts, end-to-end attempt latency, source-match count, optional helpfulness ratings, practice outcomes and prompted word error rate. WER is aggregate Levenshtein word edits divided by reference words, with lowercase/punctuation normalization; it may exceed 100%. Only the fixed safe prompts have reference transcripts. Corrections to an arbitrary question are NOT treated as ground truth.

The dashboard is a small-device testing tool, not a central research repository. Browser data is editable and not authenticated evidence. For multi-person field trials, use a reviewed consent protocol, external research governance and explicitly exported numeric records. Do not claim fairness from this MVP.

## Tests and demo

- `npm test`: core safety, privacy, model contract and failure tests. Mock responses are labelled test fixtures and never enter the app or dashboard.
- `npm run typecheck`: TypeScript.
- `npm run build`: production compile.
- `npm run test:http` while dev runs: route and failure tests, no evaluation writes.
- [Demo script](docs/DEMO.md), [deployment instructions](docs/DEPLOYMENT.md), [validation record](docs/VALIDATION.md).

## Project map

- app/page.tsx, components/journey.tsx: three journeys
- components/voice-input.tsx, lib/audio.ts: consented recording and playback
- app/api/asr, lib/asr.ts, asr/: real inference path
- lib/safety.ts: versioned knowledge base and retrieval
- lib/evaluation.ts, app/evaluation/: local anonymous measurements
- app/about/: source, privacy, model and hosting disclosures


## Need an endpoint URL?

Follow [the speech-service hosting guide](asr/README.md). Deploy the supplied Docker service on a host such as Render; the host supplies the HTTPS address. Add /transcribe to that address. Model download approval alone does not create an API endpoint. The guide names the exact files, runtime variables and health check. No hosting plan has been purchased.

After secure configuration, run `node scripts/check-asr.mjs` to verify the real authenticated model identity without sending audio. Then run the consented voice demo. Run the dependency-free Python audio tests with `python -m unittest discover -s tests -p 'test_*.py'`.
