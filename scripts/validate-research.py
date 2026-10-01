"""Summarise observer logs; never generates participant data or attests truth."""
import argparse,csv,json,re,statistics
from datetime import datetime
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument("csv");p.add_argument("--output");args=p.parse_args()
path=Path(args.csv)
if path.stat().st_size>10_000_000:raise SystemExit("Research file too large")
rows=list(csv.DictReader(path.open(encoding="utf-8-sig",newline="")))
ids=set();people=set();counts={l:0 for l in ("en","yo","ha","ig")};completed=[]
for row in rows:
 if not re.fullmatch(r"[A-Za-z0-9_-]{8,64}",row["interaction_id"]) or row["interaction_id"] in ids:raise SystemExit("Invalid or duplicate interaction ID")
 ids.add(row["interaction_id"])
 if not re.fullmatch(r"P-[a-f0-9]{12}",row["participant_code"]):raise SystemExit("Use a random P- plus 12 lowercase hex participant code")
 if row["language"] not in counts:raise SystemExit("Invalid language")
 if row["consent_version"]!="PA-2026-10-01" or not row["consented_at"]:raise SystemExit("Missing consent")
 for key in ("consented_at","session_date"):datetime.fromisoformat(row[key].replace("Z","+00:00"))
 if row["observer_attested"]!="yes" or not row["observer_code"]:raise SystemExit("Observer attestation is required")
 for key in ("voice_completed","transcript_corrected","comprehension_correct","source_found_unassisted","task_completed_unassisted"):
  if row[key] not in ("yes","no"):raise SystemExit("Invalid outcome: "+key)
 if row["journey"] not in ("before","after","learn"):raise SystemExit("Invalid journey")
 if row["device_category"] not in ("android-entry","android-other","ios","desktop","other"):raise SystemExit("Invalid device category")
 if row["network_category"] not in ("offline","2g","3g","4g","5g","wifi","unknown"):raise SystemExit("Invalid network category")
 for key in ("correction_count","reference_word_count","word_errors","asr_ms","answer_ms"):
  if row[key] and (not row[key].isdigit() or int(row[key])>1_000_000):raise SystemExit("Invalid numeric measure")
 for key in ("feedback_code","defect_id","change_id","observer_code","trace_id"):
  if row[key] and not re.fullmatch(r"[A-Za-z0-9_.-]{1,100}",row[key]):raise SystemExit("Use codes, not private/free text: "+key)
 if not re.fullmatch(r"[a-f0-9]{40}",row["build_commit"]):raise SystemExit("Missing build commit")
 if row["voice_completed"]=="yes":
  if not row["trace_id"] or not row["model_id"].startswith("NCAIR1/") or not re.fullmatch(r"[a-f0-9]{40}",row["model_revision"]):raise SystemExit("Completed voice needs model/trace evidence")
  completed.append(row);counts[row["language"]]+=1;people.add(row["participant_code"])
def proportion(key):return None if not completed else sum(r[key]=="yes" for r in completed)/len(completed)
def latency(key):
 values=sorted(int(r[key]) for r in completed if r[key])
 return {"n":len(values),"median":statistics.median(values) if values else None,"p95":values[max(0,__import__("math").ceil(len(values)*.95)-1)] if values else None}
out={"scope":"Observer-supplied logs; script checks consistency, not authenticity","recorded":len(rows),"completedVoice":len(completed),"distinctCompletedParticipants":len(people),"byLanguage":counts,"unassistedCompletion":proportion("task_completed_unassisted"),"comprehension":proportion("comprehension_correct"),"sourceFound":proportion("source_found_unassisted"),"asrMs":latency("asr_ms"),"answerMs":latency("answer_ms"),"minimum50Met":len(completed)>=50}
text=json.dumps(out,indent=2)
if args.output:Path(args.output).write_text(text,encoding="utf-8")
print(text)
