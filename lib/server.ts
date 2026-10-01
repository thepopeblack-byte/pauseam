import type {ASRConfig} from "./asr.ts";
export type Settings=ASRConfig & {KB_ENABLED?:string;TEXT_ENDPOINT?:string;TEXT_SERVICE_TOKEN?:string;TEXT_ENABLED?:string};
export async function settings():Promise<Settings>{
 try {const {env}=await import("cloudflare:workers");return env as Settings;} catch {return process.env as Settings;}
}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"}});}
export function sameOrigin(request:Request){const origin=request.headers.get("origin");return origin===new URL(request.url).origin;}
export async function boundedBody(request:Request,limit:number){
 if(Number(request.headers.get("content-length")||0)>limit)throw new Error("large");
 const reader=request.body?.getReader();if(!reader)throw new Error("empty");
 const chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit)throw new Error("large");chunks.push(value);}}finally{await reader.cancel();}
 const result=new Uint8Array(size);let offset=0;for(const c of chunks){result.set(c,offset);offset+=c.length;}return result;
}

