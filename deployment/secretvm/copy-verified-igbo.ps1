# Preserve the currently verified Igbo copy in its own folder. No deletion.
$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path
Set-Location -LiteralPath $projectRoot
python scripts/audit-model-bucket.py --bucket Blockcapitol/N-ATLaS-bucket --model ig --asr-weight --output private/igbo-before-copy.json
if ($LASTEXITCODE -ne 0) { throw "Read-only source audit failed." }
$igboAudit = Get-Content -LiteralPath private/igbo-before-copy.json -Raw | ConvertFrom-Json
if (-not $igboAudit.results[0].allRequiredFilesVerified) { throw "The bucket root no longer matches official Igbo files. No copy attempted." }
hf buckets cp "hf://buckets/Blockcapitol/N-ATLaS-bucket/.gitattributes" "hf://buckets/Blockcapitol/N-ATLaS-bucket/ig/.gitattributes"
if ($LASTEXITCODE -ne 0) { throw "Igbo copy failed; verify destination before deploying." }
hf buckets cp "hf://buckets/Blockcapitol/N-ATLaS-bucket/README.md" "hf://buckets/Blockcapitol/N-ATLaS-bucket/ig/README.md"
if ($LASTEXITCODE -ne 0) { throw "Igbo copy failed; verify destination before deploying." }
hf buckets cp "hf://buckets/Blockcapitol/N-ATLaS-bucket/added_tokens.json" "hf://buckets/Blockcapitol/N-ATLaS-bucket/ig/added_tokens.json"
if ($LASTEXITCODE -ne 0) { throw "Igbo copy failed; verify destination before deploying." }
hf buckets cp "hf://buckets/Blockcapitol/N-ATLaS-bucket/config.json" "hf://buckets/Blockcapitol/N-ATLaS-bucket/ig/config.json"
if ($LASTEXITCODE -ne 0) { throw "Igbo copy failed; verify destination before deploying." }
hf buckets cp "hf://buckets/Blockcapitol/N-ATLaS-bucket/generation_config.json" "hf://buckets/Blockcapitol/N-ATLaS-bucket/ig/generation_config.json"
if ($LASTEXITCODE -ne 0) { throw "Igbo copy failed; verify destination before deploying." }
hf buckets cp "hf://buckets/Blockcapitol/N-ATLaS-bucket/merges.txt" "hf://buckets/Blockcapitol/N-ATLaS-bucket/ig/merges.txt"
if ($LASTEXITCODE -ne 0) { throw "Igbo copy failed; verify destination before deploying." }
hf buckets cp "hf://buckets/Blockcapitol/N-ATLaS-bucket/normalizer.json" "hf://buckets/Blockcapitol/N-ATLaS-bucket/ig/normalizer.json"
if ($LASTEXITCODE -ne 0) { throw "Igbo copy failed; verify destination before deploying." }
hf buckets cp "hf://buckets/Blockcapitol/N-ATLaS-bucket/preprocessor_config.json" "hf://buckets/Blockcapitol/N-ATLaS-bucket/ig/preprocessor_config.json"
if ($LASTEXITCODE -ne 0) { throw "Igbo copy failed; verify destination before deploying." }
hf buckets cp "hf://buckets/Blockcapitol/N-ATLaS-bucket/pytorch_model.bin" "hf://buckets/Blockcapitol/N-ATLaS-bucket/ig/pytorch_model.bin"
if ($LASTEXITCODE -ne 0) { throw "Igbo copy failed; verify destination before deploying." }
hf buckets cp "hf://buckets/Blockcapitol/N-ATLaS-bucket/special_tokens_map.json" "hf://buckets/Blockcapitol/N-ATLaS-bucket/ig/special_tokens_map.json"
if ($LASTEXITCODE -ne 0) { throw "Igbo copy failed; verify destination before deploying." }
hf buckets cp "hf://buckets/Blockcapitol/N-ATLaS-bucket/tokenizer.json" "hf://buckets/Blockcapitol/N-ATLaS-bucket/ig/tokenizer.json"
if ($LASTEXITCODE -ne 0) { throw "Igbo copy failed; verify destination before deploying." }
hf buckets cp "hf://buckets/Blockcapitol/N-ATLaS-bucket/tokenizer_config.json" "hf://buckets/Blockcapitol/N-ATLaS-bucket/ig/tokenizer_config.json"
if ($LASTEXITCODE -ne 0) { throw "Igbo copy failed; verify destination before deploying." }
hf buckets cp "hf://buckets/Blockcapitol/N-ATLaS-bucket/vocab.json" "hf://buckets/Blockcapitol/N-ATLaS-bucket/ig/vocab.json"
if ($LASTEXITCODE -ne 0) { throw "Igbo copy failed; verify destination before deploying." }
python scripts/audit-model-bucket.py --bucket Blockcapitol/N-ATLaS-bucket --prefix ig --model ig --asr-weight --output private/igbo-after-copy.json
