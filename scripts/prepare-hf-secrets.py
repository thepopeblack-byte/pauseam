"""Prepare private runtime values locally; never prints values or configures an account."""
import argparse
from pathlib import Path
import secrets

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--existing',type=Path,default=ROOT/'private/secretvm/pilot.env')
parser.add_argument('--output',type=Path,default=ROOT/'private/huggingface/space.env')
args=parser.parse_args()
output=args.output.resolve()
if not output.is_relative_to((ROOT/'private').resolve()): raise SystemExit('Output must stay inside the ignored private directory')
if output.exists(): raise SystemExit('Existing private configuration preserved; no values changed')
existing={}
if args.existing.exists():
    for line in args.existing.read_text().splitlines():
        if '=' in line and not line.lstrip().startswith('#'):
            key,value=line.split('=',1);existing[key.strip()]=value.strip()
values={'HF_TOKEN':existing.get('HF_TOKEN',''),
        'TEXT_SERVICE_TOKEN':secrets.token_urlsafe(48),
        'ASR_SERVICE_TOKEN':secrets.token_urlsafe(48),
        'QUOTA_SERVICE_TOKEN':secrets.token_urlsafe(48),
        'QUOTA_ENDPOINT':'https://pauseam.theblockcapitol.com/api/model-quota'}
output.parent.mkdir(parents=True,exist_ok=True)
with output.open('x',encoding='utf-8') as stream:
    for key,value in values.items(): stream.write(key+'='+value+'\n')
print('Private Space configuration written. HF_TOKEN present: '+str(bool(values['HF_TOKEN'])))
print('No credentials printed, uploaded or configured. Enter values in private host settings yourself.')
