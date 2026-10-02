# Generated from pinned official manifests. User runs this after secure hf auth login.
$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path
Set-Location -LiteralPath $projectRoot
# About 20 GB of disk space is needed. No secrets or training states are copied.
hf download NCAIR1/N-ATLaS --revision e294476928aca9030e924ca27bb8e085e8581273 --include ".gitattributes" "README.md" "config.json" "generation_config.json" "model-00001-of-00004.safetensors" "model-00002-of-00004.safetensors" "model-00003-of-00004.safetensors" "model-00004-of-00004.safetensors" "model.safetensors.index.json" "special_tokens_map.json" "tokenizer.json" "tokenizer_config.json" --local-dir "private/model-prep/text"
if ($LASTEXITCODE -ne 0) { throw "Approved text source download failed; no upload attempted." }
hf buckets sync "private/model-prep/text" "hf://buckets/Blockcapitol/N-ATLaS-bucket/text" --filter-from "deployment/secretvm/filters/text.txt"
if ($LASTEXITCODE -ne 0) { throw "text upload failed; retain files and verify before deployment." }
hf download NCAIR1/NigerianAccentedEnglish --revision 3c52c6e6c9ec508014a7b9db6a42b503b8930dff --include ".gitattributes" "README.md" "added_tokens.json" "config.json" "generation_config.json" "merges.txt" "normalizer.json" "preprocessor_config.json" "pytorch_model.bin" "special_tokens_map.json" "tokenizer.json" "tokenizer_config.json" "vocab.json" --local-dir "private/model-prep/en"
if ($LASTEXITCODE -ne 0) { throw "Approved en source download failed; no upload attempted." }
hf buckets sync "private/model-prep/en" "hf://buckets/Blockcapitol/N-ATLaS-bucket/en" --filter-from "deployment/secretvm/filters/en.txt"
if ($LASTEXITCODE -ne 0) { throw "en upload failed; retain files and verify before deployment." }
hf download NCAIR1/Yoruba-ASR --revision d1ae7b8b79c2ccd547d8761effe5057433f3fc7f --include ".gitattributes" "README.md" "config.json" "generation_config.json" "merges.txt" "normalizer.json" "preprocessor_config.json" "pytorch_model.bin" "special_tokens_map.json" "tokenizer.json" "tokenizer_config.json" "vocab.json" --local-dir "private/model-prep/yo"
if ($LASTEXITCODE -ne 0) { throw "Approved yo source download failed; no upload attempted." }
hf buckets sync "private/model-prep/yo" "hf://buckets/Blockcapitol/N-ATLaS-bucket/yo" --filter-from "deployment/secretvm/filters/yo.txt"
if ($LASTEXITCODE -ne 0) { throw "yo upload failed; retain files and verify before deployment." }
hf download NCAIR1/Hausa-ASR --revision e635b9eda29060c6114c8f4d8b2d903f5c83a44a --include ".gitattributes" "README.md" "added_tokens.json" "config.json" "generation_config.json" "merges.txt" "normalizer.json" "preprocessor_config.json" "pytorch_model.bin" "special_tokens_map.json" "tokenizer.json" "tokenizer_config.json" "vocab.json" --local-dir "private/model-prep/ha"
if ($LASTEXITCODE -ne 0) { throw "Approved ha source download failed; no upload attempted." }
hf buckets sync "private/model-prep/ha" "hf://buckets/Blockcapitol/N-ATLaS-bucket/ha" --filter-from "deployment/secretvm/filters/ha.txt"
if ($LASTEXITCODE -ne 0) { throw "ha upload failed; retain files and verify before deployment." }
hf download NCAIR1/Igbo-ASR --revision 180732299d5cba3dc8b289260ac84b7838bb3954 --include ".gitattributes" "README.md" "added_tokens.json" "config.json" "generation_config.json" "merges.txt" "normalizer.json" "preprocessor_config.json" "pytorch_model.bin" "special_tokens_map.json" "tokenizer.json" "tokenizer_config.json" "vocab.json" --local-dir "private/model-prep/ig"
if ($LASTEXITCODE -ne 0) { throw "Approved ig source download failed; no upload attempted." }
hf buckets sync "private/model-prep/ig" "hf://buckets/Blockcapitol/N-ATLaS-bucket/ig" --filter-from "deployment/secretvm/filters/ig.txt"
if ($LASTEXITCODE -ne 0) { throw "ig upload failed; retain files and verify before deployment." }
Write-Output "Copy commands completed. Run bucket byte checks before deploying; this is not inference evidence."
