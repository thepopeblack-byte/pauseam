# PauseAm code and deployment review — 2 October 2026

This is engineering evidence, not human validation or a claim of bug-free software.
The reviewed files are on the PC and public GitHub repository. Model inference
remains disabled in the public app. No new host was launched or purchased.

## Fixes

| Finding | Change | Regression evidence |
|---|---|---|
| Correct ASR model/revision could still return the wrong or missing language | Validate returned language server-side and in the voice client | Same-identity wrong/missing-language fixture rejects |
| Late MediaRecorder events could restore cancelled/failed audio | Gate recording callbacks by operation; discard buffers after failure; stop recorder/timer on cancellation | Cancellation, delayed data/stop, failure and ordinary completion fixtures |
| Non-ASCII Authorization could raise TypeError | Shared bounded ASCII constant-time bearer guard | Malformed/oversized/missing headers reject without exceptions |
| Oversized service chunks were copied before rejection | Check size before extending the buffer | Over-limit chunk leaves buffer unchanged |
| Duplicate app body reader could let cleanup failure mask the limit error | Reuse bounded reader with safe cancellation and lock release | Cleanup-failure test preserves size rejection |
| Weak credentials incorrectly appeared configured | Require printable non-whitespace service secrets of 32–512 characters before forwarding | Both adapters reject weak/malformed secrets without upstream calls |
| SecretVM instructions pointed to a corrupt mixed bucket and stale environment overrides | Use four verified separate buckets; pinned official text repository; new credential-only private file | Both Compose files validate; source/ledger/exposure checks pass |
| Package bytes differed between Windows and Linux | Normalize text to LF; fix ZIP platform metadata | Actual six file hashes and ZIP hash match final Linux CI |
| Compact product code, redundant imports and effect/navigation lint findings | Format owned product code; use client navigation; hydrate readiness through external-store snapshots; synchronise research consent at commit | Full lint/typecheck/build pass |

## Actual checks

| Check | Result | Evidence / scope |
|---|---|---|
| Node regression tests | Passed: 44/44 | tests/core.test.ts and tests/model-quota.test.ts; fixtures are labelled engineering-only |
| Python model/deployment checks | Passed: 22/22 | unittest discovery tests/test_*.py; no model inference |
| Gateway boundary checks | Passed: 8/8 | tests/hf_gateway_test.py with isolated FastAPI/httpx dependencies |
| Full lint | Passed: zero errors/warnings | 114 inspected files; generated/private outputs excluded; original vendor exceptions retained |
| TypeScript | Passed | tsc --noEmit --allowImportingTsExtensions |
| Final app build | Passed | vinext/Vite build; all three pages and four API routes built |
| Local live HTTP | Passed: 15 checks | scripts/http-tests.mjs against localhost:5173; no research records |
| Current public app baseline | Passed: 16 checks | review-current-public-app-2026-10-02.json; this checks the prior published build, not deployment of these fixes |
| SecretVM and portable Compose | Passed | docker compose config --quiet with non-secret structural fixtures; no containers launched |
| Updated model images | Passed: actual build and offline imports | model-container-review-2026-10-02.json and review-model-runtime-2026-10-02 |
| Combined alternative image | Passed: offline imports | CI 36983160753; five processes, no weights/inference |
| Reproducible package | Passed | review-package-parity-2026-10-02.json; final CI 36984413226 |

74 unit/boundary checks passed. The HTTP checks are separate engineering requests,
not completed PS2 participant interactions. The local browser displayed an actual
typed supplier-change checklist and expanded CBN source provenance. Further UI
automation was stopped after the visible tab changed during review; consented
speech, low-end device/network and four-language comprehension checks remain pending.

## Exact remaining release actions

| Requirement | Status | Remaining action |
|---|---|---|
| Review, fixes and reproducible inference configuration | Passed | Retain current image digests and model revisions |
| Sync PC/GitHub | Passed | Use the repository's current main branch; do not publish private/*.env |
| Publish these app fixes to Sites | Blocked | Restore the installed Sites workflow bundle, then run the normal build/source-push/save/deploy workflow and recheck the custom domain |
| Real SecretVM text and four ASR models | Blocked | Team deploys deployment/secretvm/pauseam-compose.yml, enters ignored private/secretvm/deployment.env themselves and runs host/audio checks |
| Public voice/text model chain | Blocked | After successful host checks, configure full HTTPS endpoints and matching Sites secrets; enable flags, deploy and test every language |
| Representative performance/accessibility/language review | Blocked | Measure actual loaded-model latency and device/network conditions; competent speakers review critical wording and real transcripts |
| Official ASR-service/API qualification | Blocked | Obtain organiser/access-route confirmation; a self-hosted endpoint is not official API evidence |
| Completed participant validation and demo | Blocked | Run genuine consented sessions only after the voice chain works; record actual counts; capture the real demo afterward |

The Sites local workflow succeeded when opening this checkout earlier in the
session, but its cache directory disappeared before publishing. Searches of the
installed cache found no replacement. Native Site tools remain callable, but the
required source preparation workflow is missing. The read Sites hosting skill at
C:/Users/Popeblack/.codex/plugins/cache/openai-curated-remote/sites/0.1.75/skills/sites-hosting/SKILL.md
requires: “Run the bundled script directly in the selected checkout.” No replacement
script or unverified publishing route was invented. Current public code is the
prior Sites version 9; these fixes are not claimed live.

For self-deployment, start with deployment/secretvm/README.md. The ignored private
deployment.env is present with all three credential fields configured; values were
not printed. Private access status does not prove that the host can download/load
the model. Preserve the existing shared licence ledger and verify VM upgradeability
before changing workload. Keep the inactive HF alternative off and stop paid compute
after testing within the agreed total budget.

No ONDI application, completed human validation, official API request, fine-tuning,
representative mobile measurements or demo video is claimed by this review.

## Later same-day publishing recovery and owner voice pilot

The Sites workflow became available again. The reviewed app was built and
published as version 10 from commit 6680315774d07eec1fb69eb5d3a06f216ea794a0,
deployment appgdep_6abf83c90bf881919c7b48404f3a8cc3, environment revision 2.
The Windows build used an ignored checkout-local npm launcher, installed Git Bash
and TAR_OPTIONS=--force-local with the bundled workflow; no replacement packager
was created. The archive was accepted by Sites and publication succeeded.

All four ASR URLs and the matching private service secret are configured for
an initial consented owner test. Authentication and format boundaries passed
eight real requests without audio. The UI labels recognition accuracy as still
under review. No genuine speech test or validated language claim is recorded.
TEXT_ENABLED remains false: the actual text request again exceeded 45 seconds.
English source-based guidance is explicitly labelled without a generative model;
other-language guidance remains unavailable. The full model release gate fails.

All 16 public baseline checks passed on the custom domain. Detailed results and
configuration are in voice-pilot-deployment-2026-10-02.json and the latest text
failure in secretvm-amaranth-recheck-2026-10-02.json. These are engineering checks,
not completed participant interactions. The first real owner recording, host
resource diagnostics, complete multilingual journeys and human reviews remain
pending. No additional SecretVM purchase or workload deployment was performed.
