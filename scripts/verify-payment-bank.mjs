// Actual public requests; authored cases are engineering evidence, not user validation.
import fs from 'node:fs/promises';
import {BANKS} from '../lib/bank-directory.ts';
import {TEXT_MODEL} from '../lib/models.ts';
import {currentSourceCards, KB_VERSION} from '../lib/safety.ts';
const options = new Map();
for(let i=2;i<process.argv.length;i+=2){if(!['--url','--output'].includes(process.argv[i])||!process.argv[i+1])throw Error('Use --url HTTPS_ORIGIN [--output evidence.json]');options.set(process.argv[i],process.argv[i+1]);}
const url=new URL(options.get('--url')||'');
if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/')throw Error('Use a public HTTPS application origin');
const report={recordedAt:new Date().toISOString(),origin:url.origin,kind:'Live engineering checks, not recorded speech or participant validation',kbVersion:KB_VERSION,checks:[],rawUserDataReceived:false,transcriptsStored:false,participantInteractionsAdded:0};
async function post(question,journey='learn'){
 const start=performance.now();
 try{const r=await fetch(url.origin+'/api/answer',{method:'POST',headers:{Origin:url.origin,'Content-Type':'application/json'},body:JSON.stringify({question,journey,language:'en'}),redirect:'error',signal:AbortSignal.timeout(60000)});
  return {status:r.status,data:await r.json(),elapsedMs:Math.round(performance.now()-start),noStore:r.headers.get('cache-control')?.includes('no-store')===true};
 }catch{return {status:null,data:null,elapsedMs:Math.round(performance.now()-start),noStore:false};}
}
function record(name,r,passed){report.checks.push({name,status:r.status,elapsedMs:r.elapsedMs,passed:passed&&r.noStore,answerStatus:r.data?.status||null,cardIds:r.data?.cards?.map(c=>c.id)||[],bank:r.data?.bankInfo?.bank||null,model:r.data?.model===TEXT_MODEL.model?TEXT_MODEL.model:null,modelRevision:r.data?.modelRevision===TEXT_MODEL.revision?TEXT_MODEL.revision:null});}
for(const b of BANKS)for(const kind of ['email','phone','ussd']){
 const q=`What is ${b.name}'s ${kind==='phone'?'customer-care number':kind==='email'?'customer-care email':'USSD menu code'}?`;
 const r=await post(q), facts=r.data?.bankInfo?.facts;
 record(`${b.id} ${kind} is the exact official-source fact`,r,r.status===200&&r.data?.status==='ok'&&r.data.model===null&&r.data.kbVersion===KB_VERSION&&r.data.bankInfo.bank===b.name&&facts?.length===1&&facts[0].value===b[kind].value&&JSON.stringify(facts[0].source)===JSON.stringify(b[kind].source)&&r.data.cards.length===0);
}
for(const q of ["What is my bank’s customer-care number?", "What is Ecobank's customer-care email?", "GTBank or UBA USSD code?"]){const r=await post(q);record('Clarify a missing, uncovered or ambiguous bank',r,r.status===200&&r.data?.status==='no_match'&&r.data.model===null&&!r.data.bankInfo&&r.data.cards?.length===0&&r.data.bankQuery?.options?.length>0);}
for(const b of BANKS)for(const [wording,keys] of [
 ['customer-care number and email',['email','phone']],
 ['email and USSD code',['email','ussd']],
 ['customer-care number, email and USSD code',['email','phone','ussd']],
]){
 const r=await post(`What are ${b.name}'s ${wording}?`), facts=r.data?.bankInfo?.facts;
 record(`${b.id} combined ${keys.join('+')} keeps every requested fact`,r,r.status===200&&r.data?.status==='ok'&&r.data.model===null&&r.data.bankInfo.bank===b.name&&facts?.length===keys.length&&keys.every((k,i)=>facts[i].value===b[k].value&&JSON.stringify(facts[i].source)===JSON.stringify(b[k].source))&&r.data.cards.length===0);
}
let r=await post("What is GTBank's fixed deposit interest rate?");record('Unreviewed rates do not become random advice',r,r.status===200&&r.data?.status==='no_match'&&r.data.cards?.length===0&&r.data.model===null);
for(const q of ['my PIN is DUMMY_TEST_ONLY', 'account number 1234567890']){r=await post(q,'before');record('Authored dummy credential/identifier rejected',r,r.status===422&&r.data?.status==='sensitive'&&r.data.cards?.length===0&&r.data.model===null);}
const grounded=(d,id)=>d?.status==='ok'&&d.kbVersion===KB_VERSION&&d.cards?.length===1&&d.cards[0].id===id&&currentSourceCards().some(c=>c.id===id&&['title','steps','source','sourceTitle','section','why','basis','checked','expires','review'].every(k=>JSON.stringify(c[k])===JSON.stringify(d.cards[0][k])));
r=await post('A supplier asks for ₦5000 on 03/10/2026 using new bank details.','before');record('Amount/date works through genuine N-ATLaS relevance inference',r,r.status===200&&grounded(r.data,'supplier')&&r.data.model===TEXT_MODEL.model&&r.data.modelRevision===TEXT_MODEL.revision);
r=await post('I paid ₦5000 on 03/10/2026 and the seller stopped replying.','before');record('Amount/date retains urgent source-grounded bank-first actions',r,r.status===200&&grounded(r.data,'report')&&r.data.model===null);
report.passed=report.checks.every(c=>c.passed);
if(options.has('--output'))await fs.writeFile(options.get('--output'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(!report.passed)process.exitCode=1;
