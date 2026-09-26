# Deployment

## Web host: Sites / Cloudflare Workers

The registered private Site is recorded in .openai/hosting.json. Keep its project_id unchanged. No database or object-store binding is needed; evaluation is deliberately device-local.

1. Run npm ci, npm test, npm run typecheck and npm run build.
2. The Worker is dist/server/index.js; static assets are dist/client. It must export a default fetch handler. Preserve the Sites Vite build plugin.
3. Using the Sites plugin, open the existing project, run its source workflow to push this exact source, package only .openai/hosting.json plus dist/server and dist/client (exclude .dev.vars and any env/secrets), save and deploy the matching version privately.
4. Check terminal deployment status before claiming a live URL. Registration's expected_url is not proof of deployment.
5. Set ASR_ENABLED=false initially, KB_ENABLED=true. With the authenticated Python host ready, configure ASR_ENDPOINT and secret ASR_SERVICE_TOKEN through Sites environment management, then set ASR_ENABLED=true and redeploy.
6. Keep the Site private for review. Public field testing requires explicit sharing decisions, host rate limits and the real source/content review described in REVIEW.md.

The configured ASR URL is a operator-supplied HTTPS endpoint, never accepted from a user request. The browser sees neither endpoint credentials nor HF_TOKEN. Same-origin POST checks, payload bounds, timeouts, no redirects and no-store responses protect the proxy. New public deployments should enforce a host-level request quota as well as inference-service limits.

## Inference host

Build asr/Dockerfile on a Python/container host with outbound access to Hugging Face. Inject HF_TOKEN with gated model approval, ASR_SERVICE_TOKEN (random, at least 32 characters), and the pinned MODEL_REVISION. Put HTTPS in front of port 8000; do not expose an unauthenticated service. Keep one service process per model instance or configure an external shared quota. Configure proxy max body 960044 bytes, upload timeout 10 seconds and request timeout around 50 seconds.

Inspect the official model licence and memory/runtime needs. The model does not run in Cloudflare's small Worker memory. CPU is permitted but deadline suitability must be measured. Run authenticated /health, then the opt-in scripts/live-smoke.mjs with a real, consented safe recording.

Disable body logging, diagnostic payload capture and audio retention at every layer. Standard operational metadata such as IP addresses may be processed by hosting; do not advertise network anonymity. This application persists no user content server-side.

## Failure drills

- Missing keys or ASR_ENABLED=false: voice unavailable, typed input remains.
- Wrong bearer, model revision, non-JSON, empty or private transcript, timeout: no fabricated transcription.
- KB_ENABLED=false or cards past expiry: no guidance returned as a matched answer.
- Network failure: message to pause and use independently trusted bank support.
- Browser storage denied: app works; saving a local test reports failure.
- Clear local evaluation: records gone; no claimed server copy.
- After-fraud entry: bank-contact advice appears before interacting with the model.

## Reproducibility limits

The npm lockfile fixes the web dependency graph. Python top-level versions are pinned in asr/requirements.txt; transitive Python resolution and the Docker base tag are not immutable. For a formally reproducible research deployment, freeze a platform-specific pip lock with hashes and an approved container digest after testing on the actual inference host. No such tested container digest or live model benchmark is invented here.

