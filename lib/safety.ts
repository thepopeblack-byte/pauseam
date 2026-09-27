export const MODEL = "NCAIR1/NigerianAccentedEnglish";
export const REVISION = "3c52c6e6c9ec508014a7b9db6a42b503b8930dff";
export const MODEL_URL = "https://huggingface.co/" + MODEL;
export const KB_VERSION = "2026-09-26.1";
export type Journey = "before" | "after" | "learn";
export type Card = {id:string; title:string; keywords:string[]; steps:string[]; source:string; sourceTitle:string; section:string; checked:string; expires:string; review:string};
const review = {checked:"2026-09-26",expires:"2026-12-26",review:"Source-checked by Codex (automated); independent human review pending"};
const fraud = "https://www.cbn.gov.ng/supervision/cpdfraudandscam.html";
export const CARDS:Card[] = [
 {id:"impersonation",title:"Pause and verify the request",keywords:["link","caller","call","bank","message","whatsapp","otp","pin","password","code","urgent","prize","fee","grant"],steps:["Do not open a suspicious link or disclose banking secrets.","Contact the organisation independently to check who is asking. Pressure to act is a reason to pause."],source:fraud,sourceTitle:"CBN · Fraud and Scam Awareness",section:"Phishing scams; social engineering",...review},
 {id:"shopping",title:"Check the seller before paying",keywords:["seller","shop","buy","purchase","delivery","goods","phone","market","online","item"],steps:["Check independent reviews and the seller’s credibility.","An unusually attractive deal can be a warning. A secure-looking website alone does not verify a seller."],source:fraud,sourceTitle:"CBN · Fraud and Scam Awareness",section:"Online shopping scams",...review},
 {id:"investment",title:"Be cautious about promised returns",keywords:["investment","invest","profit","double","return","crypto","ponzi"],steps:["Promises of quick profits with little risk are warning signs.","Research independently and seek qualified advice before committing money."],source:fraud,sourceTitle:"CBN · Fraud and Scam Awareness",section:"Investment scams",...review},
 {id:"report",title:"Contact your bank immediately",keywords:["scam","fraud","stolen","sent","paid","lost","debited","hacked"],steps:["Contact your bank through a trusted official channel now. Ask it to secure the affected account and investigate the transaction.","If access was compromised, change passwords through the official service and enable two-factor authentication.","Report suspected fraud to the relevant authorities. Recovery is not guaranteed."],source:fraud,sourceTitle:"CBN · Fraud and Scam Awareness",section:"How to report fraud and scams",...review},
 {id:"secrets",title:"Your secrets are yours to protect",keywords:["pin","otp","password","secret","credential","code","codes","banking"],steps:["Keep your PIN, passwords and banking codes private.","Report suspected fraud or compromised banking information promptly to your bank. Do not enter those details in this app."],source:"https://www.cbn.gov.ng/FinInc/FinLit/BillOfRights.html",sourceTitle:"CBN · Bank Customers’ Bill of Rights and Duties",section:"Duty to protect instruments and information; duty to report suspected fraud",...review},
 {id:"complaint",title:"Keep a record of your complaint",keywords:["complaint","escalate","unresolved","refund","reference"],steps:["Lodge your complaint with your bank first and ask for a tracking reference.","If it remains unresolved, use the CBN complaint guidance to check the applicable escalation process. Do not wait to report suspected fraud."],source:"https://www.cbn.gov.ng/Out/2022/CCD/CBN%20How%20to%20Lodge%20a%20Complaint.pdf",sourceTitle:"CBN · How to Lodge a Complaint",section:"Contact your institution first; if your bank fails to resolve",...review}
];
export function containsSensitive(text:string):boolean {
 return /\d/.test(text) || /\b(?:zero|one|two|three|four|five|six|seven|eight|nine)(?:[\s,-]+(?:zero|one|two|three|four|five|six|seven|eight|nine)){2,}\b/i.test(text)
 || /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text)
 || /\b(?:my|the)\s+(?:pin|otp|password|passcode|credential|account number)\s*(?:is|:|=)\s*\S+/i.test(text);
}
export type Answer = {status:"ok"|"unavailable"|"no_match"|"sensitive"; cards:Card[]; message:string; engine:string; model:null; kbVersion:string};
export function retrieve(question:string,journey:Journey,options:{disabled?:boolean;now?:Date;cards?:Card[]}={}):Answer {
 const base={engine:"Reviewed-source keyword retrieval (no generative answer model)",model:null,kbVersion:KB_VERSION};
 if(containsSensitive(question))return {...base,status:"sensitive",cards:[],message:"Remove all numbers and private details. Describe only the situation."};
 if(options.disabled)return {...base,status:"unavailable",cards:[],message:"The safety library is unavailable. I cannot assess this request. Pause the payment and contact your bank through a trusted channel."};
 const now=options.now||new Date();
 const cards=(options.cards||CARDS).filter(c=>c.checked&&Date.parse(c.expires+"T23:59:59Z")>=now.getTime()&&c.source.startsWith("https://www.cbn.gov.ng/"));
 if(!cards.length)return {...base,status:"unavailable",cards:[],message:"No current source-checked guidance is available. Pause and ask your bank through an independently trusted channel."};
 const text=question.toLowerCase();
 const urgent=journey==="after"||/\b(already paid|already sent|been scammed|was scammed|account hacked|money stolen|unauthori[sz]ed)\b/.test(text);
 const tokens=new Set(text.match(/[a-z]+/g)||[]);
 const scored=cards.map(c=>({c,score:c.keywords.filter(k=>tokens.has(k)).length+(urgent&&c.id==="report"?100:0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
 if(!scored.length)return {...base,status:"no_match",cards:[],message:"I don’t have a source-backed match for this situation. Try a safety topic below, or contact your bank directly. I cannot tell you that a payment is safe."};
 return {...base,status:"ok",cards:scored.slice(0,2).map(x=>x.c),message:"These are safety steps, not a verdict on a person or payment."};
}
export const TEST_PROMPTS = ["Someone sent me a link and asked for my banking code.","I already paid a seller and I think it is a scam.","An investment promises to double my money."];
export function wordErrors(reference:string,hypothesis:string){
 const words=(s:string)=>s.toLowerCase().replace(/[^a-z\s]/g,"").trim().split(/\s+/).filter(Boolean);
 const a=words(reference),b=words(hypothesis);let row=b.map((_,i)=>i+1);row.unshift(0);
 for(let i=1;i<=a.length;i++){const next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+Number(a[i-1]!==b[j-1]));row=next;}
 return {errors:row[b.length],words:a.length};
}


