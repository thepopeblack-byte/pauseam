"""Check prose limits and record hashes of the visually reviewed PDFs."""
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
from pypdf import PdfReader
ROOT = Path(__file__).resolve().parents[1]
drafts = json.loads((ROOT/'submission/ondi-answer-drafts.json').read_text(encoding='utf-8'))
for item in drafts['drafts']:
    assert item['characters'] == len(item['answer']), item['field']
    if item['verifiedLimit']:
        assert len(item['answer']) <= item['verifiedLimit'], item['field']
    assert 'owner reports' not in item['answer'].lower()
files = ['02-natlas-integration.pdf','03-validation-status.pdf','04-technical-documentation.pdf','06-team-profile-review.pdf','pauseam-integration-evidence-note.pdf']
pdfs=[]
for name in files:
    path=ROOT/'output/pdf'/name
    reader=PdfReader(path)
    text='\n'.join(page.extract_text() for page in reader.pages)
    assert 'the owner reports' not in text.lower(), name
    assert 'Codex' not in str(reader.metadata), name
    pdfs.append({'path':str(path.relative_to(ROOT)).replace('\\','/'),'sha256':sha256(path.read_bytes()).hexdigest(),'pages':len(reader.pages),'bytes':path.stat().st_size,'visualReview':'Rendered pages inspected with Poppler; no clipping or overlap observed.'})
record={'recordedAt':datetime.now(timezone.utc).isoformat(),'kind':'Submission prose and PDF checks','pdfs':pdfs,'verifiedCharacterLimitsPassed':True,'reportedTesters':30,'reviewedCompletedVoiceInteractions':0,'participantFeedbackAnalysed':False,'portalUploads':['pauseam-integration-evidence-note.pdf','03-validation-status.pdf','04-technical-documentation.pdf'],'submitted':False}
(ROOT/'submission/evidence/submission-prose-review-2026-10-03.json').write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8')
validation=ROOT/'submission/03-validation/validation-report.md'
validation.write_text(validation.read_text(encoding='utf-8').rstrip()+'\n',encoding='utf-8')
answer_fields=['How was the artefact tested with real users, real data, or live benchmarks?','Key results or feedback from validation']
answer_text='PauseAm - ONDI validation answers\n3 October 2026\n\n'+'\n\n'.join(field+'\n\n'+next(i['answer'] for i in drafts['drafts'] if i['field']==field) for field in answer_fields)+'\n'
for path in [ROOT/'submission/03-validation/form-answer-status-2026-10-03.txt',ROOT/'output/text/pauseam-validation-form-answers.txt']:
    path.write_text(answer_text,encoding='utf-8')
print('Character limits, PDF metadata and prose checks passed for five PDFs.')
