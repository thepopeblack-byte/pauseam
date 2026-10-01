import {settings,json,sameOrigin,boundedBody} from "@/lib/server";
import {retrieve} from "@/lib/safety";
import {isLanguage} from "@/lib/models";
import {modelGuidance,textEndpoint} from "@/lib/text-model";
import {allowRequest} from "@/lib/rate-limit";
export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:"Request origin rejected."},403);
 if(!allowRequest("answer",90))return json({error:"Too many requests. Try again in a minute."},429);
 try{const data=JSON.parse(new TextDecoder().decode(await boundedBody(request,4096)));
 const language=data.language||"en";
 if(typeof data.question!=="string"||data.question.length>600||!data.question.trim()||!["before","after","learn"].includes(data.journey)||!isLanguage(language))return json({error:"Choose a journey and enter a short situation without private details."},400);
 const s=await settings();let answer=retrieve(data.question,data.journey,{disabled:s.KB_ENABLED==="false"});
 // Privacy/source checks precede inference. Urgent actions do not await a model.
 if(answer.status!=="unavailable"&&answer.status!=="sensitive"&&data.journey!=="after"&&answer.cards[0]?.id!=="report"){
  if(textEndpoint(s)){
   try{answer=await modelGuidance(data.question,data.journey,language,s,request.signal);}
   catch{answer={...answer,status:"unavailable",cards:[],message:"N-ATLaS did not return verified guidance. Pause and verify independently. General information is available in the source directory."};}
  }else if(language!=="en")answer={...answer,status:"unavailable",cards:[],message:"Guidance in this language is not ready. Use English source checklists or contact your bank independently."};
 }
 return json(answer,answer.status==="unavailable"?503:answer.status==="sensitive"?422:200);
 }catch{return json({error:"Cannot read this request. No guidance was generated."},400);}
}
