"""Read-only hash audit. No file writes to a bucket, inference, or weight retention."""
import argparse
import hashlib
import json
import re
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--bucket', required=True)
parser.add_argument('--prefix', default='')
parser.add_argument('--asr-weight', action='store_true', help='Also stream and hash the approximately 967 MB ASR weight; no local copy is kept')
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
if not re.fullmatch(r'[A-Za-z0-9_-]+/[A-Za-z0-9_.-]+', args.bucket): parser.error('Invalid bucket ID')
if args.prefix and any(not re.fullmatch(r'[A-Za-z0-9_.-]+', p) or p in ('.','..') for p in args.prefix.split('/')): parser.error('Invalid prefix')
manifests = {'text':json.loads((root/'text_service/model-manifest.json').read_text())}
manifests.update({lang:json.loads((root/'asr/manifests'/f'{lang}.json').read_text()) for lang in ('en','yo','ha','ig')})
entries = {}
for manifest in manifests.values():
    for entry in manifest['files']: entries.setdefault(entry['path'], []).append(entry)

def inspect(item):
    name, expectations = item
    maximum = max(e['size'] for e in expectations)
    if maximum > 25*1024*1024 and not (name=='pytorch_model.bin' and args.asr_weight): return name, {'status':'not_downloaded'}
    relative = (args.prefix+'/' if args.prefix else '')+name
    url = 'https://huggingface.co/buckets/'+args.bucket+'/resolve/'+urllib.parse.quote(relative)
    try:
        with urllib.request.urlopen(url,timeout=120) as response:
            sha=hashlib.sha256(); count=0; small=bytearray()
            for block in iter(lambda:response.read(1024*1024),b''):
                count += len(block)
                if count>maximum: return name, {'status':'oversized','bytesRead':count}
                sha.update(block)
                if maximum<=25*1024*1024: small.extend(block)
        row={'status':'downloaded','size':count,'sha256':sha.hexdigest()}
        if small: row['git-sha1']=hashlib.sha1(b'blob '+str(count).encode()+b'\0'+small).hexdigest()
        return name,row
    except urllib.error.HTTPError as err: return name,{'status':'http_error','httpStatus':err.code}
    except Exception as err: return name,{'status':'error','errorType':type(err).__name__}

with ThreadPoolExecutor(max_workers=4) as pool: observed=dict(pool.map(inspect,entries.items()))
results=[]
for key,manifest in manifests.items():
    rows=[]
    for entry in manifest['files']:
        actual=observed[entry['path']]
        match=actual.get('size')==entry['size'] and actual.get(entry['algorithm'])==entry['digest']
        rows.append({'file':entry['path'],'matchesOfficialBytes':match,'observation':actual})
    results.append({'target':key,'model':manifest['model'],'revision':manifest['revision'],'allRequiredFilesVerified':all(r['matchesOfficialBytes'] for r in rows),'matchedFiles':sum(r['matchesOfficialBytes'] for r in rows),'requiredFiles':len(rows),'files':rows})
report={'recordedAt':datetime.now(timezone.utc).isoformat(),'kind':'read-only byte audit; no inference or human validation','bucket':args.bucket,'prefix':args.prefix,'asrWeightStreamed':args.asr_weight,'results':results}
args.output.parent.mkdir(parents=True,exist_ok=True)
args.output.write_text(json.dumps(report,indent=2),encoding='utf-8')
for row in results: print(f"{row['model']}: {row['matchedFiles']}/{row['requiredFiles']} file hashes match; complete verification={row['allRequiredFilesVerified']}")
