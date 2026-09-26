import {settings,json,sameOrigin,boundedBody} from "@/lib/server";
import {retrieve} from "@/lib/safety";
export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:"Request origin rejected."},403);
 try{const data=JSON.parse(new TextDecoder().decode(await boundedBody(request,4096)));
 if(typeof data.question!=="string"||data.question.length>600||!data.question.trim()||!["before","after","learn"].includes(data.journey))return json({error:"Choose a journey and enter a short situation without private details."},400);
 const s=await settings();const answer=retrieve(data.question,data.journey,{disabled:s.KB_ENABLED==="false"});
 return json(answer,answer.status==="unavailable"?503:answer.status==="sensitive"?422:200);
 }catch{return json({error:"Cannot read this request. No guidance was generated."},400);}
}

