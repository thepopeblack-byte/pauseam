"""Prepare commands only: no login, transfer, deletion, or credential handling."""
import argparse, json, re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--bucket',required=True)
args=parser.parse_args()
if not re.fullmatch(r'[A-Za-z0-9_-]+/[A-Za-z0-9_.-]+',args.bucket): parser.error('Invalid bucket ID')
destination=root/'deployment/secretvm';destination.mkdir(parents=True,exist_ok=True)
models={'text':root/'text_service/model-manifest.json',**{lang:root/'asr/manifests'/f'{lang}.json' for lang in ('en','yo','ha','ig')}}
lines=['# Generated from pinned official manifests. User runs this after secure hf auth login.',
       '$ErrorActionPreference = "Stop"',
       '$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path',
       'Set-Location -LiteralPath $projectRoot',
       '# About 20 GB of disk space is needed. No secrets or training states are copied.']
for language,source in models.items():
    model=json.loads(source.read_text()); files=[entry['path'] for entry in model['files']]
    assert all(re.fullmatch(r'[A-Za-z0-9_.-]+',name) for name in files)
    filters=destination/'filters'/f'{language}.txt';filters.parent.mkdir(parents=True,exist_ok=True)
    filters.write_text('\n'.join('+ '+name for name in files)+'\n- **\n',encoding='utf-8')
    source_dir=f'private/model-prep/{language}'
    include=' '.join('"'+name+'"' for name in files)
    lines += [f'hf download {model["model"]} --revision {model["revision"]} --include {include} --local-dir "{source_dir}"',
              f'if ($LASTEXITCODE -ne 0) {{ throw "Approved {language} source download failed; no upload attempted." }}',
              f'hf buckets sync "{source_dir}" "hf://buckets/{args.bucket}/{language}" --filter-from "deployment/secretvm/filters/{language}.txt"',
              f'if ($LASTEXITCODE -ne 0) {{ throw "{language} upload failed; retain files and verify before deployment." }}']
lines += ['Write-Output "Copy commands completed. Run bucket byte checks before deploying; this is not inference evidence."']
(destination/'copy-models.ps1').write_text('\n'.join(lines)+'\n',encoding='utf-8')
igbo=json.loads(models['ig'].read_text())
ig_lines=['# Preserve the currently verified Igbo copy in its own folder. No deletion.',
          '$ErrorActionPreference = "Stop"',
          '$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path',
          'Set-Location -LiteralPath $projectRoot',
          f'python scripts/audit-model-bucket.py --bucket {args.bucket} --model ig --asr-weight --output private/igbo-before-copy.json',
          'if ($LASTEXITCODE -ne 0) { throw "Read-only source audit failed." }',
          '$igboAudit = Get-Content -LiteralPath private/igbo-before-copy.json -Raw | ConvertFrom-Json',
          'if (-not $igboAudit.results[0].allRequiredFilesVerified) { throw "The bucket root no longer matches official Igbo files. No copy attempted." }']
for entry in igbo['files']:
    name=entry['path']
    ig_lines += [f'hf buckets cp "hf://buckets/{args.bucket}/{name}" "hf://buckets/{args.bucket}/ig/{name}"',
                 'if ($LASTEXITCODE -ne 0) { throw "Igbo copy failed; verify destination before deploying." }']
ig_lines += [f'python scripts/audit-model-bucket.py --bucket {args.bucket} --prefix ig --model ig --asr-weight --output private/igbo-after-copy.json']
(destination/'copy-verified-igbo.ps1').write_text('\n'.join(ig_lines)+'\n',encoding='utf-8')
print('Prepared five separate model-folder copy commands; no files transferred.')
