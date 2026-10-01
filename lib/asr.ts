import {MODEL,REVISION,containsSensitive} from "./safety.ts";
import {readLimited} from "./stream.ts";
export function configuredEndpoint(config:{ASR_ENDPOINT?:string;ASR_SERVICE_TOKEN?:string;ASR_ENABLED?:string}) {
 if(config.ASR_ENABLED!=="true"||!config.ASR_ENDPOINT||!config.ASR_SERVICE_TOKEN)return null;
 try {const url=new URL(config.ASR_ENDPOINT);return url.protocol==="https:"&&!url.username&&!url.password&&!url.search&&!url.hash?url:null;}catch{return null;}
}
export const MAX_AUDIO=960044;
export function validWav(bytes:Uint8Array){
 if(bytes.length<44||bytes.length>MAX_AUDIO)return false;
 const d=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),txt=(n:number,l:number)=>new TextDecoder().decode(bytes.slice(n,n+l));
 return txt(0,4)==="RIFF"&&txt(8,4)==="WAVE"&&txt(12,4)==="fmt "&&d.getUint32(16,true)===16&&d.getUint16(20,true)===1&&d.getUint16(22,true)===1&&d.getUint32(24,true)===16000&&d.getUint32(28,true)===32000&&d.getUint16(32,true)===2&&d.getUint16(34,true)===16&&txt(36,4)==="data"&&d.getUint32(40,true)===bytes.length-44&&d.getUint32(4,true)===bytes.length-8&&(bytes.length-44)%2===0&&bytes.length>=16044;
}
export async function transcribe(bytes:Uint8Array,config:{ASR_ENDPOINT?:string;ASR_SERVICE_TOKEN?:string;ASR_ENABLED?:string},fetcher:typeof fetch=fetch,signal?:AbortSignal){
 const url=configuredEndpoint(config);if(!url)throw new Error("unavailable");
 if(!validWav(bytes))throw new Error("audio");
 const timeout=AbortSignal.timeout(45000);
 const response=await fetcher(url,{method:"POST",headers:{"Authorization":"Bearer "+config.ASR_SERVICE_TOKEN,"Content-Type":"audio/wav"},body:bytes as BodyInit,signal:signal?AbortSignal.any([signal,timeout]):timeout,redirect:"error"});
 if(!response.ok){await response.body?.cancel();throw new Error("inference");}
 const raw=new TextDecoder().decode(await readLimited(response.body,8192));
 const data=JSON.parse(raw);
 if(data.model!==MODEL||data.revision!==REVISION||typeof data.text!=="string"||!data.text.trim()||data.text.length>1000)throw new Error("provenance");
 if(containsSensitive(data.text))throw new Error("sensitive");
 return {text:data.text.trim(),model:MODEL,revision:REVISION};
}

