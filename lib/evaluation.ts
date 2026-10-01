export const EVAL_KEY="pauseam-evaluation-v1";
const LEGACY_KEY="before-you-pay-evaluation-v1";
export type Trial={kind:"answer"|"asr"|"quiz";journey:"before"|"after"|"learn";outcome:"ok"|"failed"|"no_match";latencyMs:number;helpful?:boolean;errors?:number;words?:number};
export function cleanTrial(input:unknown):Trial|null{
 if(!input||typeof input!=="object")return null;const t=input as Trial;
 if(!["answer","asr","quiz"].includes(t.kind)||!["before","after","learn"].includes(t.journey)||!["ok","failed","no_match"].includes(t.outcome)||!Number.isFinite(t.latencyMs)||t.latencyMs<0||t.latencyMs>120000)return null;
 const r:Trial={kind:t.kind,journey:t.journey,outcome:t.outcome,latencyMs:Math.round(t.latencyMs)};
 if(typeof t.helpful==="boolean")r.helpful=t.helpful;
 if(t.kind==="asr"&&t.outcome==="ok"&&Number.isInteger(t.errors)&&Number.isInteger(t.words)&&t.errors!>=0&&t.errors!<=500&&t.words!>0&&t.words!<=100){r.errors=t.errors;r.words=t.words;}
 return r;
}
export function readTrials():Trial[]{try{const data=JSON.parse(localStorage.getItem(EVAL_KEY)||localStorage.getItem(LEGACY_KEY)||"[]");return Array.isArray(data)?data.map(cleanTrial).filter((x):x is Trial=>!!x).slice(-500):[];}catch{return [];}}
export function saveTrial(trial:Trial){const t=cleanTrial(trial);if(!t)return false;try{localStorage.setItem(EVAL_KEY,JSON.stringify([...readTrials(),t].slice(-500)));return true;}catch{return false;}}
export function clearTrials(){localStorage.removeItem(EVAL_KEY);localStorage.removeItem(LEGACY_KEY);}
export function summary(rows:Trial[]){
 const asr=rows.filter(x=>x.kind==="asr"),measured=asr.filter(x=>x.errors!==undefined&&x.words!==undefined),errors=measured.reduce((s,x)=>s+x.errors!,0),words=measured.reduce((s,x)=>s+x.words!,0);
 const answers=rows.filter(x=>x.kind==="answer"),ratings=answers.filter(x=>x.helpful!==undefined);
 return {total:rows.length,asrAttempts:asr.length,asrSuccess:asr.filter(x=>x.outcome==="ok").length,wer:words?errors/words:null,werSamples:measured.length,errors,words,answerAttempts:answers.length,matched:answers.filter(x=>x.outcome==="ok").length,ratings:ratings.length,helpful:ratings.filter(x=>x.helpful).length,meanAsrMs:asr.length?Math.round(asr.reduce((s,x)=>s+x.latencyMs,0)/asr.length):null};
}

