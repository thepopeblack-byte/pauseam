# PauseAm: confidentiality claims and boundaries

Reviewed 3 October 2026. This is a description of the deployed design, not a
security certification. No application submission has been made.

## Suggested submission wording

> PauseAm runs its official N-ATLaS ASR and text models on SecretVM
> confidential-computing infrastructure. Requests use HTTPS, model access stays
> server-side, and the application does not retain recordings or questions by
> default. VM attestation verification remains pending.

Do not claim that everything is confidential, that nobody can access inputs,
that the complete journey is end-to-end encrypted, or that this deployment has
been independently security audited.

## Actual data flow

Browser → HTTPS → Sites backend → HTTPS with server-side authentication →
SecretVM gateway → English ASR or N-ATLaS text inference.

The Sites backend processes plaintext audio/text before forwarding it. SecretVM
protection therefore applies to model hosting; it does not establish a direct
attested encrypted channel from the browser to the model. Application code and
operators remain part of the trust boundary. Provider metadata and logging
policies have not been independently audited.

Application code avoids retaining raw audio and question content by default.
Research requires separate consent and records limited anonymous metadata.
User-downloaded incident reports are files under the user's control. This is
not a promise that providers retain no metadata or that memory is immediately
erased throughout every managed runtime.

## Evidence and remaining checks

- The owner-provided VM information identifies AMD SEV and Google KMS.
  The exact attestation claims and KMS configuration have not been verified.
- The documented CPU attestation endpoint at
  `https://amaranth-nightingale.vm.scrtlabs.com:29343/cpu.html` returned HTTP 200
  with normal TLS validation on 3 October. Reachability is not quote verification.
- No verified quote/workload match is currently recorded in this package.
- Inspect [the deployed Compose file](../deployment/secretvm/english-complete-compose.yml)
  and pinned image digests; it contains placeholders, not private credentials.
- Validate the quote and expected workload with the
  [official quick-verification procedure](https://docs.scrt.network/secret-network-documentation/secretvm-confidential-virtual-machines/verifying-a-secretvm/quick-verification).
  Record the result, time, workload revision and matching measurements. A mismatch
  must be investigated, not presented as successful attestation.
- Check provider/gateway/container logging, persistent storage and KMS settings.
  Built-in attestation-server TLS verification alone does not prove that the
  application gateway on port 443 is bound to the same attested channel.

Code locations for the current boundaries: `app/api/asr/route.ts`,
`app/api/answer/route.ts`, `lib/asr.ts`, `lib/text-model.ts`,
`text_cpu/app.py`, and `app/about/page.tsx`.

## Current submission status

The owner confirmed on 3 October that testers are ready but sessions and the
demo video have not been completed. Documented participant interactions remain
0; owner smoke checks are not participant validation. Complete at least 50
genuine documented PS2 interactions and a real 3–5 minute video, obtain the
organiser's official-ASR-service qualification finding, and reconcile/review all
seven final items before submission. See the
[official requirements](https://ncair.nitda.gov.ng/naic/) and
[release gate](RELEASE-GATE.md).
