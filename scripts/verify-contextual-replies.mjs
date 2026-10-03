// Genuine public requests with authored cases. No speech or participant evidence.
import fs from 'node:fs/promises';
import {KB_VERSION,currentSourceCards} from '../lib/safety.ts';
import {TEXT_MODEL} from '../lib/models.ts';
const options=new Map();
for(let i=2;i<process.argv.length;i+=2){if(!['--url','--output','--case'].includes(process.argv[i])||!process.argv[i+1])throw Error('Use --url HTTPS_ORIGIN [--output evidence.json] [--case exact-case-name]');options.set(process.argv[i],process.argv[i+1]);}
const origin=new URL(options.get('--url')||'');
if(origin.protocol!=='https:'||origin.username||origin.password||origin.pathname!=='/'||origin.search||origin.hash)throw Error('Use a public HTTPS origin');
const report={recordedAt:new Date().toISOString(),origin:origin.origin,kind:'Live engineering checks with authored questions; not voice accuracy or participant validation',kbVersion:KB_VERSION,checks:[],participantInteractionsAdded:0,rawUserDataReceived:false};
const cases=[
 ['Supplier pressure','A supplier changed bank details and wants ₦5000 today.','before','supplier',true,a=>a.guidance?.details.some(d=>d.title==='About the deadline')&&a.guidance?.followUp],
 ['Completed independent callback','A supplier changed bank details. I independently confirmed the change using an existing contact.','before','supplier',true,a=>!a.guidance?.followUp&&a.guidance?.summary.includes('does not authenticate')],
 ['Bank deduction','My bank deducted money twice.','before','complaint',true,a=>a.guidance?.title.includes('deduction')],
 ['Missing credit after debit','My bank debited the transfer but the recipient has not received it.','before','complaint',true,a=>a.guidance?.title.includes('debited for')],
 ['Existing complaint','My bank complaint remains unresolved. I already contacted the bank.','after','complaint',false,a=>a.guidance?.title.includes('existing bank complaint')&&a.guidance?.steps[0].text.includes('existing complaint reference')],
 ['Paid seller disappeared','I paid ₦5000 on 03/10/2026 and the seller disappeared.','before','report',false,a=>a.guidance?.details.some(d=>d.text.includes('not guaranteed'))],
 ['Clarify a vague payment concern','I need help with a payment','before',null,false,a=>a.status==='no_match'&&a.cards?.length===0&&a.clarification?.choices.length===4&&!a.guidance],
 ['General bank definition has no invented safety scenario','What is a bank?','learn',null,false,a=>a.status==='no_match'&&!a.guidance&&!a.bankInfo&&a.cards?.length===0],
 ['Combined bank contacts stay exact','What are GTBank’s customer-care number and email?','learn',null,false,a=>a.status==='ok'&&a.bankInfo?.facts.length===2&&!a.guidance],
 ['Authored dummy secret is rejected','my PIN is DUMMY_TEST_ONLY','before',null,false,a=>a.status==='sensitive'&&!a.guidance&&!a.clarification&&a.cards?.length===0],
];
const selected=options.has('--case')?cases.filter(c=>c[0]===options.get('--case')):cases;
if(!selected.length)throw Error('Unknown test case');
for(const [name,question,journey,cardId,modelRequired,extra] of selected){
 const start=performance.now();let entry;
 try{
  const response=await fetch(origin.origin+'/api/answer',{method:'POST',headers:{Origin:origin.origin,'Content-Type':'application/json'},body:JSON.stringify({question,journey,language:'en'}),redirect:'error',signal:AbortSignal.timeout(60000)});
  const a=await response.json();
  const source=cardId?currentSourceCards().find(c=>c.id===cardId):null;
  const grounded=!cardId||(a.status==='ok'&&a.cards?.length===1&&a.cards[0].id===cardId&&a.cards[0].source===source?.source&&a.guidance?.sourceId===cardId);
  const provenance=modelRequired?a.model===TEXT_MODEL.model&&a.modelRevision===TEXT_MODEL.revision:a.model===null;
  entry={name,httpStatus:response.status,outcome:a.status,cardIds:a.cards?.map(c=>c.id)||[],model:a.model===TEXT_MODEL.model?TEXT_MODEL.model:null,modelRevision:a.modelRevision===TEXT_MODEL.revision?TEXT_MODEL.revision:null,guidanceTitle:a.guidance?.title||null,clarificationChoices:a.clarification?.choices.length||0,traceId:typeof a.traceId==='string'?a.traceId:null,elapsedMs:Math.round(performance.now()-start),passed:(name==='Authored dummy secret is rejected'?response.status===422:response.status===200)&&a.kbVersion===KB_VERSION&&grounded&&provenance&&Boolean(extra(a))&&response.headers.get('cache-control')?.includes('no-store')===true};
 }catch{entry={name,httpStatus:null,elapsedMs:Math.round(performance.now()-start),passed:false};}
 report.checks.push(entry);
}
report.passed=report.checks.every(c=>c.passed);
if(options.has('--output'))await fs.writeFile(options.get('--output'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.passed,total:report.checks.length,failures:report.checks.filter(c=>!c.passed),output:options.get('--output')||null},null,2));
if(!report.passed)process.exitCode=1;
