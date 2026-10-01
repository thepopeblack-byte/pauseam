import {settings,json,sameOrigin,boundedBody} from "@/lib/server";
import {transcribe,MAX_AUDIO} from "@/lib/asr";
export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:"Request origin rejected."},403);
 if(request.headers.get("x-audio-consent")!=="yes")return json({error:"Audio-processing consent is required."},400);
 if(request.headers.get("content-type")!=="audio/wav")return json({error:"Use mono 16 kHz WAV audio."},415);
 try {const bytes=await boundedBody(request,MAX_AUDIO);try{const start=performance.now();const result=await transcribe(bytes,await settings(),fetch,request.signal);return json({...result,latencyMs:Math.round(performance.now()-start)});}finally{bytes.fill(0);}}
 catch(error){const sensitive=error instanceof Error&&error.message==="sensitive";return json({error:sensitive?"Private details may have been spoken. The transcript was discarded. Try again without numbers or secrets.":"Speech recognition is unavailable or the audio could not be processed. No transcript was created for use. Please type your question."},sensitive?422:503);}
}


