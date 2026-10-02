// Real requests only. No generated audio, substitute model, or participant claims.
import fs from 'node:fs/promises';
import path from 'node:path';
import {TEXT_MODEL,LANGUAGES as ASR_MODELS} from '../lib/models.ts';
import {modelGuidance} from '../lib/text-model.ts';
import {readLimited} from '../lib/stream.ts';
const values=new Map();
if(process.argv.includes('--help')){console.log('node --experimental-strip-types --env-file=private/secretvm/deployment.env scripts/verify-model-host.mjs --host https://YOUR_ACTUAL_HOST --output private/host-check.json [--scope english|all] [--mode health|inference] [--audio-directory private/consented-audio]\nDefaults: scope all, mode inference. English scope checks only ASR; typed source guidance is checked by verify-public-app. Health mode performs no inference.');process.exit(0);}
for(let i=2;i<process.argv.length;i+=2){if(!process.argv[i+1])throw Error('Each option needs a value');values.set(process.argv[i],process.argv[i+1]);}
if([...values.keys()].some(key=>!['--host','--output','--mode','--scope','--audio-directory'].includes(key)))throw Error('Unknown option; use --help');
const mode=values.get('--mode')||'inference';
const scope=values.get('--scope')||'all';
if(!['english','all'].includes(scope))throw Error('Scope must be english or all');
if(!['health','inference'].includes(mode))throw Error('Mode must be health or inference');
if(mode==='health'&&values.has('--audio-directory'))throw Error('Health mode does not upload audio; use inference mode for consented recordings');
const url=new URL(values.get('--host')||'');
if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/')throw Error('Use an HTTPS model host origin without private details');
if(!process.env.ASR_SERVICE_TOKEN||(scope==='all'&&!process.env.TEXT_SERVICE_TOKEN))throw Error('Load the required service credentials privately with Node --env-file; never put them in arguments');
const report={recordedAt:new Date().toISOString(),kind:'Engineering requests, not participant validation',host:url.origin,mode,scope,health:[],text:[],speech:[],officialApiVerified:false,fineTuningPerformed:false};
async function request(route,token,options={}){
 const start=performance.now();
 let status=null;
 try{
  const r=await fetch(url.origin+route,{...options,redirect:'error',signal:AbortSignal.timeout(45000),headers:{...options.headers,Authorization:'Bearer '+token}});
  status=r.status;
  const data=JSON.parse(new TextDecoder().decode(await readLimited(r.body,8192)));
  return {status:r.status,elapsedMs:Math.round(performance.now()-start),data};
 }catch{return {status,elapsedMs:Math.round(performance.now()-start),data:null};}
}
const selectedASR=Object.entries(ASR_MODELS).filter(([language])=>scope==='all'||language==='en');
const targets=[...(scope==='all'?[['text',TEXT_MODEL,process.env.TEXT_SERVICE_TOKEN]]:[]),...selectedASR.map(([language,model])=>[language,model,process.env.ASR_SERVICE_TOKEN])];
await Promise.all(targets.map(async([target,model,token])=>{
 const route=target==='text'?'/text/health':`/asr/${target}/health`;
 const r=await request(route,token);
 const valid=r.status===200&&r.data?.ready===true&&r.data.model===model.model&&r.data.revision===model.revision&&(target==='text'||r.data.language===target);
 report.health.push({target,status:r.status,elapsedMs:r.elapsedMs,passed:valid,model:valid?r.data.model:null,revision:valid?r.data.revision:null});
}));
if(scope==='all'&&mode==='inference'&&report.health.find(r=>r.target==='text')?.passed){
 const start=performance.now();
 try{
  const result=await modelGuidance('A supplier has emailed new bank details and wants payment today. What should I check?','before','en',{TEXT_ENABLED:'true',KB_ENABLED:'true',TEXT_ENDPOINT:url.origin+'/text/guide',TEXT_SERVICE_TOKEN:process.env.TEXT_SERVICE_TOKEN});
  report.text.push({case:'Authored supplier-change engineering question',contractPassed:true,expectedCardSelected:result.cards.some(c=>c.id==='supplier'),status:result.status,cardIds:result.cards.map(c=>c.id),model:result.model,revision:result.modelRevision,elapsedMs:Math.round(performance.now()-start)});
 }catch{report.text.push({case:'Authored supplier-change engineering question',contractPassed:false,expectedCardSelected:false,elapsedMs:Math.round(performance.now()-start)});}
}
const audioDirectory=values.get('--audio-directory');
if(audioDirectory){
 if(process.env.AUDIO_TEST_CONSENT!=='yes')throw Error('Use only consented non-sensitive recordings; set AUDIO_TEST_CONSENT=yes privately before upload');
 for(const [language] of selectedASR){
  if(!report.health.find(r=>r.target===language)?.passed){report.speech.push({language,performed:false,reason:'Health identity unavailable'});continue;}
  let raw;
  try{raw=await fs.readFile(path.join(audioDirectory,language+'.wav'));}catch{report.speech.push({language,performed:false,reason:'No supplied recording'});continue;}
  if(raw.length>960044)throw Error('Recording exceeds upload limit');
  const r=await request(`/asr/${language}/transcribe`,process.env.ASR_SERVICE_TOKEN,{method:'POST',headers:{'Content-Type':'audio/wav'},body:raw});
  raw.fill(0);
  const model=ASR_MODELS[language];
  const passed=r.status===200&&r.data?.model===model.model&&r.data.revision===model.revision&&r.data.language===language&&typeof r.data.text==='string'&&r.data.text.trim().length>0;
  report.speech.push({language,performed:true,status:r.status,elapsedMs:r.elapsedMs,passed,model:passed?model.model:null,revision:passed?model.revision:null,transcriptReceived:passed,accuracyReviewed:false});
  r.data=null; // Do not export or print a transcript.
 }
}
report.allHealthPassed=report.health.every(r=>r.passed);
report.textGuidancePassed=report.text.some(r=>r.contractPassed&&r.expectedCardSelected);
report.fourLanguageInferencePassed=report.speech.length===4&&report.speech.every(r=>r.passed);
report.selectedSpeechInferencePassed=report.speech.length===selectedASR.length&&report.speech.every(r=>r.passed);
const output=values.get('--output');
if(output){await fs.mkdir(path.dirname(output),{recursive:true});await fs.writeFile(output,JSON.stringify(report,null,2));}
console.log(JSON.stringify(report,null,2));
if(!report.allHealthPassed||(scope==='all'&&mode==='inference'&&!report.textGuidancePassed)||(scope==='english'&&mode==='inference'&&!report.selectedSpeechInferencePassed)||(audioDirectory&&!report.selectedSpeechInferencePassed))process.exitCode=1;
