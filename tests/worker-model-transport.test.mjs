// Runtime regression fixtures only: no external calls, speech inference or model output.
import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Miniflare} from 'miniflare';

test('Workers model adapters reject redirects without runtime incompatibility or forwarding', async () => {
  const result=await build({stdin:{contents:`
    import {transcribe} from './lib/asr.ts';
    import {modelGuidance} from './lib/text-model.ts';
    export default {async fetch(){
      const results=[];
      const bytes=new Uint8Array(16044),view=new DataView(bytes.buffer);
      const word=(n,s)=>{for(let i=0;i<s.length;i++)bytes[n+i]=s.charCodeAt(i);};
      word(0,'RIFF');view.setUint32(4,16036,true);word(8,'WAVE');word(12,'fmt ');
      view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);
      view.setUint32(24,16000,true);view.setUint32(28,32000,true);
      view.setUint16(32,2,true);view.setUint16(34,16,true);word(36,'data');view.setUint32(40,16000,true);
      for(const adapter of ['asr','text']){
        let calls=0,mode=null;
        const transport=async(url,init)=>{
          calls++;mode=init.redirect;
          // Validate the real adapter's options in Workers, where Node differs.
          new Request(url,init);
          return new Response(null,{status:307,headers:{Location:'https://untrusted.example.invalid/'}});
        };
        let failure=null;
        try{
          const credential='fixture-only-not-a-real-service-secret';
          if(adapter==='asr')await transcribe(bytes,{ASR_ENABLED:'true',ASR_ENDPOINT:'https://model.example.invalid/asr',ASR_SERVICE_TOKEN:credential},transport);
          else await modelGuidance('A supplier changed bank details','before','en',{TEXT_ENABLED:'true',KB_ENABLED:'true',TEXT_ENDPOINT:'https://model.example.invalid/guide',TEXT_SERVICE_TOKEN:credential},undefined,transport);
        }catch(e){failure=e.message;}
        results.push({adapter,calls,mode,failure});
      }
      bytes.fill(0);
      return Response.json(results);
    }};
  `,resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,format:'esm',platform:'browser',target:'es2022'});
  const mf=new Miniflare({modules:true,script:result.outputFiles[0].text,compatibilityDate:'2026-05-15'});
  try{
    const response=await mf.dispatchFetch('http://localhost/');
    assert.equal(response.status,200);
    assert.deepEqual(await response.json(),[
      {adapter:'asr',calls:1,mode:'manual',failure:'inference'},
      {adapter:'text',calls:1,mode:'manual',failure:'inference'},
    ]);
  }finally{await mf.dispose();}
});
