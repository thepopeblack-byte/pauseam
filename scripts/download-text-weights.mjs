// Private approved access only. No weights or access credentials enter the repository.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const manifest=JSON.parse(await fs.readFile(path.join(root,'text_service/model-manifest.json'),'utf8'));
if(!process.env.HF_TOKEN) throw Error('Set approved HF_TOKEN privately using --env-file.');
const directory=path.join(root,'private/quantization/source');
await fs.mkdir(directory,{recursive:true});
async function matches(file,entry){
 try{
  const stat=await fs.lstat(file);
  if(!stat.isFile()||stat.isSymbolicLink()||stat.size!==entry.size)return false;
  const hash=createHash(entry.algorithm==='sha256'?'sha256':'sha1');
  if(entry.algorithm==='git-sha1')hash.update(`blob ${entry.size}\0`);
  for await(const chunk of createReadStream(file))hash.update(chunk);
  return hash.digest('hex')===entry.digest;
 }catch{return false;}
}
async function download(entry){
 if(!/^[a-zA-Z0-9_.-]+$/.test(entry.path)||['.','..'].includes(entry.path))throw Error('Invalid pinned manifest.');
 const final=path.join(directory,entry.path),partial=final+'.download';
 if(await matches(final,entry)){console.log('Verified cache: '+entry.path);return;}
 for(let attempt=0;attempt<3;attempt++){
  let file;
  let status=null;
  try{
   const offset=await fs.stat(partial).then(s=>s.size).catch(()=>0);
   const response=await fetch(`https://huggingface.co/${manifest.model}/resolve/${manifest.revision}/${entry.path}`,{
    headers:{Authorization:'Bearer '+process.env.HF_TOKEN,...(offset?{Range:`bytes=${offset}-`}:{})},signal:AbortSignal.timeout(1800000)});
   status=response.status;
   if(![200,206].includes(response.status)){
    await response.body?.cancel();
    throw Error('Approved file access failed (HTTP '+response.status+').');
   }
   if(response.status===206&&!response.headers.get('content-range')?.startsWith(`bytes ${offset}-`)){
    await response.body?.cancel();throw Error('Invalid download range.');
   }
   let count=response.status===206?offset:0;
   file=await fs.open(partial,response.status===206?'a':'w');
   for await(const chunk of response.body){count+=chunk.length;if(count>entry.size)throw Error('Oversized model file.');await file.write(chunk);}
   await file.close();file=null;
   if(!await matches(partial,entry)){await fs.unlink(partial);throw Error('Pinned file checksum failed.');}
   await fs.rename(partial,final);console.log('Downloaded and verified: '+entry.path);return;
  }catch(error){
   await file?.close();
   console.log(JSON.stringify({file:entry.path,attempt:attempt+1,httpStatus:status,errorType:error.name,errorCode:error.code||error.cause?.code||null}));
   if(attempt===2)throw Error('Download incomplete for '+entry.path+'. Check approved access/network privately.');
  }
 }
}
const queue=[...manifest.files];
await Promise.all([0,1].map(async()=>{while(queue.length)await download(queue.shift());}));
await fs.writeFile(path.join(root,'private/quantization/source-verification.json'),JSON.stringify({model:manifest.model,revision:manifest.revision,recordedAt:new Date().toISOString(),files:manifest.files,allBytesVerified:true,inferencePerformed:false},null,2));
console.log('All official pinned bytes verified. This is not inference or fine-tuning evidence.');
