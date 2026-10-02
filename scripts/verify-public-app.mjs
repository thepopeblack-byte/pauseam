// Engineering requests only. No participant records or fabricated model output.
import fs from 'node:fs/promises';
import path from 'node:path';
import {LANGUAGES, TEXT_MODEL} from '../lib/models.ts';
import {currentSourceCards, KB_VERSION, containsSensitive} from '../lib/safety.ts';
import {validWav} from '../lib/asr.ts';
import {readLimited} from '../lib/stream.ts';

if (process.argv.includes('--help')) {
  console.log('node --experimental-strip-types scripts/verify-public-app.mjs --url https://ACTUAL_APP --output report.json [--require-models --audio-directory private/consented-audio]');
  process.exit(0);
}
const opts = new Map();
for (let i=2;i<process.argv.length;i++) {
  const key=process.argv[i];
  if(key==='--require-models'){opts.set(key,true);continue;}
  if(!['--url','--output','--audio-directory'].includes(key)||!process.argv[i+1]||process.argv[i+1].startsWith('--')) throw Error('Unknown or incomplete option; use --help');
  opts.set(key,process.argv[++i]);
}
const origin=new URL(opts.get('--url')||'');
if(origin.protocol!=='https:'||origin.username||origin.password||origin.search||origin.hash||origin.pathname!=='/') throw Error('Use the public HTTPS application origin without private details');
if(opts.has('--audio-directory')&&process.env.AUDIO_TEST_CONSENT!=='yes') throw Error('Consented, non-sensitive real recordings required; set AUDIO_TEST_CONSENT=yes privately');
const report={recordedAt:new Date().toISOString(),origin:origin.origin,kind:'Engineering checks, not user validation',checks:[],models:{configured:false,textInferencePassed:false,speech:[]},transcriptsStored:false,participantRecordsCreated:0};
let configuration=null;
async function request(route,init={}){
  const start=performance.now();
  try {
    const r=await fetch(origin.origin+route,{...init,redirect:'error',signal:AbortSignal.timeout(60000)});
    const raw=await readLimited(r.body,route.startsWith('/api/')?32768:1048576);
    const data=route.startsWith('/api/')?JSON.parse(new TextDecoder().decode(raw)):null;
    return {status:r.status,data,elapsedMs:Math.round(performance.now()-start),noStore:r.headers.get('cache-control')?.includes('no-store')===true};
  }catch{return {status:null,data:null,elapsedMs:Math.round(performance.now()-start),noStore:false};}
}
function record(name,r,passed,details={}){report.checks.push({name,status:r.status,elapsedMs:r.elapsedMs,passed,...details});}
function grounded(answer){
  if(answer?.status!=='ok'||answer.kbVersion!==KB_VERSION||!Array.isArray(answer.cards)||answer.cards.length!==1)return false;
  const publicFields=['title','steps','source','sourceTitle','section','why','basis','checked','expires','review'];
  return answer.cards.every(c=>currentSourceCards().some(s=>c.id===s.id&&publicFields.every(field=>JSON.stringify(c[field])===JSON.stringify(s[field]))));
}
function modelIdentity(answer){return answer?.model===TEXT_MODEL.model&&answer?.modelRevision===TEXT_MODEL.revision;}
const post=(question,journey='before',language='en',requestOrigin=origin.origin)=>request('/api/answer',{method:'POST',headers:{'Content-Type':'application/json',Origin:requestOrigin},body:JSON.stringify({question,journey,language})});
let r=await request('/api/status');
configuration=r.data;
const identity=r.status===200&&configuration?.model===LANGUAGES.en.model&&configuration.revision===LANGUAGES.en.revision&&Object.entries(LANGUAGES).every(([lang,m])=>configuration?.languages?.[lang]?.model===m.model&&configuration.languages[lang].revision===m.revision);
record('Pinned targets and private status response',r,identity&&r.noStore);
r=await request('/api/model-quota',{method:'POST'});
record('Unauthenticated licence reservation fails closed',r,[401,503].includes(r.status)&&r.data?.reserved===false&&r.noStore);
report.models.configured=identity&&configuration.textConfigured===true&&Object.values(configuration.languages).every(m=>m.configured===true);
for(const route of ['/','/about','/evaluation']){r=await request(route);record('Page '+route,r,r.status===200);}
r=await post('A supplier changed the bank details on an invoice.');
const supplier=grounded(r.data)&&r.data.cards[0].id==='supplier';
record('Supplier-change guidance has expected source and steps',r,r.status===200&&supplier&&r.noStore,{engine:r.data?.engine||null,model:r.data?.model||null});
report.models.textInferencePassed=supplier&&modelIdentity(r.data);
for(const [question,id] of [
 ['My transfer has not arrived in the recipient bank','complaint'],
 ['They want me to use different bank details','supplier'],
 ['I sent money but the seller stopped replying','report'],
 ['Should I send money to someone I met?','payment'],
]){const a=await post(question);record('Everyday phrasing: '+id,a,a.status===200&&grounded(a.data)&&a.data.cards[0].id===id);}
r=await post('Who will win the football match?');
record('Unrelated question gets an honest limit',r,r.status===200&&r.data?.status==='no_match'&&r.data.cards.length===0&&r.data.model===null);
r=await post('I may have paid a scammer.','after');
record('Immediate bank-contact checklist bypasses inference',r,r.status===200&&grounded(r.data)&&r.data.cards[0].id==='report'&&r.data.model===null);
r=await post('Someone asks for my banking code.','learn');
record('Learning guidance remains source-grounded',r,r.status===200&&grounded(r.data));
// Deliberately authored dummy input; no genuine secret or personal data is sent.
r=await post('my PIN is DUMMY_TEST_VALUE');
record('Private-detail rejection',r,r.status===422&&r.data?.status==='sensitive'&&r.data.cards.length===0);
r=await post('bank','before','en','https://untrusted.example');record('Unrelated origin rejected',r,r.status===403);
r=await post('x'.repeat(5000));record('Oversized input rejected',r,r.status===400);
r=await request('/api/asr',{method:'POST',headers:{Origin:origin.origin,'Content-Type':'audio/wav'},body:new Uint8Array(44)});record('Audio consent required',r,r.status===400);
r=await request('/api/asr',{method:'POST',headers:{Origin:origin.origin,'Content-Type':'text/plain','X-Audio-Consent':'yes'},body:'Authored non-audio input'});record('Unsupported audio rejected',r,r.status===415);
for(const language of ['yo','ha','ig']){
 r=await request('/api/asr',{method:'POST',headers:{Origin:origin.origin,'Content-Type':'audio/wav','X-Audio-Consent':'yes','X-Language':language},body:new Uint8Array()});
 record('Paused '+language+' voice rejected before inference',r,r.status===503&&r.data?.error==='This pilot accepts English recordings only.');
}
for(const lang of ['yo','ha','ig']){
  if(configuration?.textConfigured===true)continue; // These requests would be real inference after enablement.
  r=await post('supplier','before',lang);record('Unconfigured '+lang+' guidance fails safely',r,r.status===503&&r.data?.status==='unavailable'&&r.data.cards.length===0);
}
if(opts.has('--audio-directory')){
  for(const [language,model] of Object.entries(LANGUAGES)){
    if(configuration?.languages?.[language]?.enabled===false)continue;
    if(configuration?.languages?.[language]?.configured!==true){report.models.speech.push({language,performed:false,passed:false,reason:'Model endpoint unconfigured'});continue;}
    let audio;
    try{audio=await fs.readFile(path.join(opts.get('--audio-directory'),language+'.wav'));}catch{report.models.speech.push({language,performed:false,passed:false,reason:'Consented recording missing'});continue;}
    if(!validWav(audio)){audio.fill(0);report.models.speech.push({language,performed:false,passed:false,reason:'Unsupported WAV format or duration'});continue;}
    r=await request('/api/asr',{method:'POST',headers:{Origin:origin.origin,'Content-Type':'audio/wav','X-Language':language,'X-Audio-Consent':'yes'},body:audio});audio.fill(0);
    const speech=r.status===200&&r.data?.model===model.model&&r.data.revision===model.revision&&r.data.language===language&&typeof r.data.text==='string'&&r.data.text.trim().length>0&&!containsSensitive(r.data.text);
    const result={language,performed:true,status:r.status,elapsedMs:r.elapsedMs,passed:speech,guidancePassed:false,accuracyReviewed:false,transcriptCorrectionReviewed:false};
    // Exercises the API chain only; fluent reviewers must correct and confirm in the UI.
    if(speech){const a=await post(r.data.text,'before',language);result.guidancePassed=a.status===200&&grounded(a.data)&&(configuration.textConfigured?modelIdentity(a.data):language==='en'&&a.data.model===null);result.guidanceElapsedMs=a.elapsedMs;}
    r.data=null;report.models.speech.push(result);
  }
}
report.baselinePassed=report.checks.every(c=>c.passed);
report.models.fourLanguageJourneyPassed=report.models.speech.length===4&&report.models.speech.every(s=>s.passed&&s.guidancePassed);
report.models.englishPilotJourneyPassed=report.models.speech.some(s=>s.language==='en'&&s.passed&&s.guidancePassed);
report.modelReleaseGatePassed=report.models.configured&&report.models.textInferencePassed&&report.models.fourLanguageJourneyPassed;
report.remaining=['Fluent critical wording review','Observed transcript correction and comprehension','Representative mobile/network testing','Genuine participant validation'];
if(opts.has('--output')){await fs.mkdir(path.dirname(opts.get('--output')),{recursive:true});await fs.writeFile(opts.get('--output'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report,null,2));
if(!report.baselinePassed||(opts.has('--require-models')&&!report.modelReleaseGatePassed))process.exitCode=1;
