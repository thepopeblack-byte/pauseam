"""Summarise observer logs; never generates participant data or attests truth."""
import argparse,csv,json,re,statistics
from datetime import datetime,timezone
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument("csv");p.add_argument("--output");args=p.parse_args()
path=Path(args.csv)
if path.stat().st_size>10_000_000:raise SystemExit("Research file too large")
rows=list(csv.DictReader(path.open(encoding="utf-8-sig",newline="")))
root=Path(__file__).resolve().parents[1]
models={language:json.loads((root/'asr/manifests'/f'{language}.json').read_text()) for language in ('en','yo','ha','ig')}
ids=set();people=set();counts={l:0 for l in ("en","yo","ha","ig")};completed=[]
for row in rows:
 if not re.fullmatch(r"[A-Za-z0-9_-]{8,64}",row["interaction_id"]) or row["interaction_id"] in ids:raise SystemExit("Invalid or duplicate interaction ID")
 ids.add(row["interaction_id"])
 if not re.fullmatch(r"P-[a-f0-9]{12}",row["participant_code"]):raise SystemExit("Use a random P- plus 12 lowercase hex participant code")
 if row["language"] not in counts:raise SystemExit("Invalid language")
 if row["consent_version"]!="PA-2026-10-01" or not row["consented_at"]:raise SystemExit("Missing consent")
 dates={key:datetime.fromisoformat(row[key].replace("Z","+00:00")) for key in ("consented_at","session_date")}
 if any(d.tzinfo is None for d in dates.values()):raise SystemExit("Dates need explicit timezone offsets")
 if dates['consented_at']>dates['session_date'] or dates['session_date']>datetime.now(timezone.utc):raise SystemExit("Consent must precede a real, non-future session")
 if row["observer_attested"]!="yes" or not row["observer_code"]:raise SystemExit("Observer attestation is required")
 for key in ("voice_completed","transcript_corrected","comprehension_correct","task_completed_unassisted"):
  if row[key] not in ("yes","no"):raise SystemExit("Invalid outcome: "+key)
 if row['source_found_unassisted'] not in ('yes','no','n/a'):raise SystemExit('Invalid legacy source outcome')
 if row.get('bank_first_found_unassisted','') not in ('','yes','no'):raise SystemExit('Invalid bank-first outcome')
 if row["journey"] not in ("before","after","learn"):raise SystemExit("Invalid journey")
 if row["device_category"] not in ("android-entry","android-other","ios","desktop","other"):raise SystemExit("Invalid device category")
 if row["network_category"] not in ("offline","2g","3g","4g","5g","wifi","unknown"):raise SystemExit("Invalid network category")
 for key in ("correction_count","reference_word_count","word_errors","asr_ms","answer_ms"):
  if row[key] and (not row[key].isdigit() or int(row[key])>1_000_000):raise SystemExit("Invalid numeric measure")
 for key in ("feedback_code","defect_id","change_id","observer_code","trace_id"):
  if row[key] and not re.fullmatch(r"[A-Za-z0-9_.-]{1,100}",row[key]):raise SystemExit("Use codes, not private/free text: "+key)
 if not re.fullmatch(r"[a-f0-9]{40}",row["build_commit"]):raise SystemExit("Missing build commit")
 if row["voice_completed"]=="yes":
  official=models[row['language']]
  if not re.fullmatch(r"[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}",row["trace_id"]) or row["model_id"]!=official['model'] or row["model_revision"]!=official['revision']:raise SystemExit("Completed voice needs the exact official ASR identity and returned request reference")
  completed.append(row);counts[row["language"]]+=1;people.add(row["participant_code"])
def proportion(key):
 measured=[r for r in completed if r.get(key) in ('yes','no')]
 return None if not measured else sum(r[key]=='yes' for r in measured)/len(measured)
def latency(key):
 values=sorted(int(r[key]) for r in completed if r[key])
 return {"n":len(values),"median":statistics.median(values) if values else None,"p95":values[max(0,__import__("math").ceil(len(values)*.95)-1)] if values else None}
out={"scope":"Observer-supplied logs; script checks consistency, not authenticity","recorded":len(rows),"completedVoice":len(completed),"distinctCompletedParticipants":len(people),"byLanguage":counts,"unassistedCompletion":proportion("task_completed_unassisted"),"comprehension":proportion("comprehension_correct"),"sourceFound":proportion("source_found_unassisted"),"bankFirstFound":proportion('bank_first_found_unassisted'),"bankFirstMeasured":sum(r.get('bank_first_found_unassisted') in ('yes','no') for r in completed),"asrMs":latency("asr_ms"),"answerMs":latency("answer_ms"),"minimum50Met":len(completed)>=50}
text=json.dumps(out,indent=2)
if args.output:Path(args.output).write_text(text,encoding="utf-8")
print(text)
