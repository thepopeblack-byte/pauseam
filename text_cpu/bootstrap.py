"""Convert verified official weights once. This is quantization, not fine-tuning."""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
from datetime import datetime, timezone
from huggingface_hub import hf_hub_download
from verified_weights import file_matches, validate_manifest
from contract import MODEL, REVISION, LLAMA_COMMIT, QUANTIZATION

def manifest_file():
    local=Path(__file__).with_name('model-manifest.json')
    return local if local.exists() else Path(__file__).parents[1]/'text_service/model-manifest.json'

def digest(file):
    h = hashlib.sha256()
    with Path(file).open('rb') as stream:
        for chunk in iter(lambda:stream.read(1024*1024),b''):
            h.update(chunk)
    return h.hexdigest()

def prepare(source, destination, converter, quantizer):
    source, destination = Path(source), Path(destination)
    manifest = json.loads(manifest_file().read_text(encoding='utf-8'))
    entries = validate_manifest(manifest,MODEL,REVISION)
    if not all(file_matches((source/e['path']).resolve(),e) for e in entries):
        raise RuntimeError('Official source checksum verification failed')
    destination.mkdir(parents=True,exist_ok=True)
    output = destination/'model-Q4_K_M.gguf'
    receipt_path = destination/'provenance.json'
    if output.exists() and receipt_path.exists():
        receipt = json.loads(receipt_path.read_text())
        if (receipt.get('model')==MODEL and receipt.get('revision')==REVISION and
            receipt.get('converterRevision')==LLAMA_COMMIT and receipt.get('quantization')==QUANTIZATION and
            receipt.get('sha256')==digest(output) and receipt.get('size')==output.stat().st_size):
            return output,receipt
        raise RuntimeError('Quantized cache integrity failed; inspect privately')
    intermediate = destination/'conversion-f16.gguf'
    temporary = destination/'conversion-Q4_K_M.gguf'
    # Official converter uses lazy safetensor loading. Original source weights
    # and tokenizer are unchanged. No calibration/evaluation data is invented.
    subprocess.run([sys.executable,str(converter),str(source),'--outfile',str(intermediate),'--outtype','f16'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    subprocess.run([str(quantizer),str(intermediate),str(temporary),QUANTIZATION,'4'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    if temporary.stat().st_size < 1_000_000_000:
        raise RuntimeError('Unexpected converted model size')
    checksum = digest(temporary)
    receipt = {'model':MODEL,'revision':REVISION,'converterRevision':LLAMA_COMMIT,'quantization':QUANTIZATION,
        'sha256':checksum,'size':temporary.stat().st_size,'sourceFilesVerified':entries,
        'createdAt':datetime.now(timezone.utc).isoformat(),'fineTuningPerformed':False}
    os.replace(temporary,output)
    temporary_receipt = receipt_path.with_suffix('.tmp')
    temporary_receipt.write_text(json.dumps(receipt,indent=2),encoding='utf-8')
    os.replace(temporary_receipt,receipt_path)
    # Only the generated intermediate is removed; official weights and licence
    # state remain available for reproduction and comparison.
    intermediate.unlink()
    return output,receipt

def approved_source():
    manifest = json.loads(manifest_file().read_text())
    entries = validate_manifest(manifest,MODEL,REVISION)
    root = Path(os.environ['VERIFIED_MODEL_CACHE'])/REVISION
    root.mkdir(parents=True,exist_ok=True)
    for entry in entries:
        final = root/entry['path']
        if file_matches(final,entry):
            continue
        actual = Path(hf_hub_download(MODEL,entry['path'],revision=REVISION,token=os.environ.get('HF_TOKEN') or None)).resolve()
        if not file_matches(actual,entry):
            raise RuntimeError('Approved source checksum failed')
        # Local hub cache and verified folder live in the same persistent volume.
        # Copy fallback handles filesystems without hard-link support.
        temporary = final.with_suffix(final.suffix+'.download')
        temporary.unlink(missing_ok=True)
        try:
            os.link(actual,temporary)
        except OSError:
            import shutil
            shutil.copyfile(actual,temporary)
        os.replace(temporary,final)
    return root
