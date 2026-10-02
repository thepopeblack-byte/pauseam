"""Create a code-only Docker Space upload bundle. No account writes or purchases."""
import argparse
import hashlib
import json
from pathlib import Path
import zipfile

ROOT=Path(__file__).resolve().parents[1]
FILES={
 'Dockerfile':'deployment/huggingface-space/Dockerfile',
 'README.md':'deployment/huggingface-space/SPACE_README.md',
 'http_safety.py':'model_service/http_safety.py',
 'gateway.py':'deployment/huggingface-space/gateway.py',
 'launcher.py':'deployment/huggingface-space/launcher.py',
 'approved-sources.json':'deployment/models/approved-sources.json',
}

def package(output):
    if output.resolve().is_relative_to(ROOT/'deployment/huggingface-space'):
        raise ValueError('Keep generated packages outside the source folder')
    output.mkdir(parents=True,exist_ok=True)
    records=[]
    with zipfile.ZipFile(output/'pauseam-hf-cpu-space.zip','w',compression=zipfile.ZIP_DEFLATED) as archive:
        for name,relative in sorted(FILES.items()):
            # All upload inputs are text; use identical LF bytes on Windows/Linux.
            raw=(ROOT/relative).read_bytes().replace(b'\r\n',b'\n')
            (output/name).write_bytes(raw)
            info=zipfile.ZipInfo(name,date_time=(2026,10,2,0,0,0))
            info.create_system=3
            info.compress_type=zipfile.ZIP_DEFLATED
            info.external_attr=0o100644<<16
            archive.writestr(info,raw)
            records.append({'path':name,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()})
    manifest={'files':records,'archiveSha256':hashlib.sha256((output/'pauseam-hf-cpu-space.zip').read_bytes()).hexdigest(),
              'weightsIncluded':False,'credentialsIncluded':False,'hostCreated':False,'inferencePerformed':False}
    (output/'package-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    return manifest

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',type=Path,default=ROOT/'output/huggingface-space')
    print(json.dumps(package(parser.parse_args().output),indent=2))
