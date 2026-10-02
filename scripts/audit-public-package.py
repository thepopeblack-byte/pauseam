"""Check public candidate files for exact known private-token values without revealing them."""
from pathlib import Path
import subprocess
import zipfile
import io
import json
ROOT=Path(__file__).resolve().parents[1]
known=set()
for file in (ROOT/'private').glob('**/*.env'):
    for line in file.read_text(errors='ignore').splitlines():
        if '=' in line:
            key,value=line.split('=',1)
            if key.strip().endswith('_TOKEN') and len(value.strip())>=16: known.add(value.strip().encode())
names=subprocess.check_output(['git','-c','safe.directory='+ROOT.as_posix(),'ls-files','--cached','--others','--exclude-standard','-z'],cwd=ROOT).decode().split('\0')
violations=[]
count=0
for name in filter(None,names):
    file=ROOT/name
    if not file.is_file(): continue
    raw=file.read_bytes();count+=1
    pieces=[raw]
    if file.suffix=='.zip':
        with zipfile.ZipFile(io.BytesIO(raw)) as archive: pieces.extend(archive.read(entry) for entry in archive.namelist())
    if any(token in piece for token in known for piece in pieces): violations.append(name)
print(json.dumps({'candidateFilesChecked':count,'knownPrivateValuesChecked':len(known),'exactPrivateTokenLeaks':violations,'scope':'Exact known-token scan, not a general security audit'}))
raise SystemExit(1 if violations else 0)
