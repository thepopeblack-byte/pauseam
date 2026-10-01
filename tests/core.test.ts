import test from "node:test";
import assert from "node:assert/strict";
import {CARDS,MODEL,REVISION,retrieve,containsSensitive,wordErrors} from "../lib/safety.ts";
import {validWav,transcribe} from "../lib/asr.ts";
import {cleanTrial,summary} from "../lib/evaluation.ts";
const now=new Date("2026-09-26T12:00:00Z");
test("before-payment guidance has real CBN sources and honest provenance",()=>{const a=retrieve("A seller wants payment for delivery","before",{now});assert.equal(a.status,"ok");assert.equal(a.cards[0].id,"shopping");assert.equal(a.model,null);assert.match(a.cards[0].review,/human review pending/);});
test("after-payment gives urgent reporting even without keyword",()=>assert.equal(retrieve("Please help","after",{now}).cards[0].id,"report"));
test("urgent text overrides wrong journey",()=>assert.equal(retrieve("I already paid a seller","before",{now}).cards[0].id,"report"));
test("out of scope abstains rather than inventing",()=>{const a=retrieve("What is the weather?","before",{now});assert.equal(a.status,"no_match");assert.equal(a.cards.length,0);});
test("disabled, missing and expired retrieval fails closed",()=>{for(const options of [{disabled:true},{cards:[]},{now:new Date("2027-01-01")}])assert.equal(retrieve("bank","before",{now,...options}).status,"unavailable");});
test("untrusted source is never retrieved",()=>assert.equal(retrieve("bank","before",{now,cards:CARDS.map(c=>({...c,source:"https://attacker.example"}))}).status,"unavailable"));
for(const secret of ["my PIN is 1234","my password is ExampleSecret","zero one two three","email me at tester@example.invalid","1234567890"]){test("private pattern rejected: "+secret.split(" ")[0],()=>{assert.equal(containsSensitive(secret),true);assert.equal(retrieve(secret,"before",{now}).status,"sensitive");});}
test("asking about OTP safety is allowed",()=>assert.equal(containsSensitive("Someone asks for my OTP"),false));
test("review registry has unique ids and valid dates",()=>{assert.equal(new Set(CARDS.map(c=>c.id)).size,CARDS.length);for(const c of CARDS){assert.ok(c.section);assert.ok(Date.parse(c.expires)>Date.parse(c.checked));}});
test("WER derives actual edit distance, including insertions",()=>{assert.deepEqual(wordErrors("one two three","one three"),{errors:1,words:3});assert.deepEqual(wordErrors("hello","hello extra words"),{errors:2,words:1});});
test("empty evaluation shows unmeasured, never sample results",()=>{const s=summary([]);assert.equal(s.total,0);assert.equal(s.wer,null);assert.equal(s.meanAsrMs,null);});
test("telemetry whitelist strips text, audio, credentials and identifiers",()=>{const value=cleanTrial({kind:"answer",journey:"before",outcome:"ok",latencyMs:20,question:"secret",id:"user",audio:"data",password:"secret"});assert.deepEqual(value,{kind:"answer",journey:"before",outcome:"ok",latencyMs:20});});
test("malformed telemetry and WER fields rejected",()=>{assert.equal(cleanTrial({kind:"custom",latencyMs:1}),null);assert.equal(cleanTrial({kind:"asr",journey:"before",outcome:"ok",latencyMs:1,words:-1,errors:-1})?.words,undefined);});
function wav(){const b=new Uint8Array(16044),d=new DataView(b.buffer);const s=(i:number,t:string)=>b.set(new TextEncoder().encode(t),i);s(0,"RIFF");d.setUint32(4,b.length-8,true);s(8,"WAVE");s(12,"fmt ");d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,1,true);d.setUint32(24,16000,true);d.setUint32(28,32000,true);d.setUint16(32,2,true);d.setUint16(34,16,true);s(36,"data");d.setUint32(40,b.length-44,true);return b;}
const config={ASR_ENABLED:"true",ASR_ENDPOINT:"https://inference.example/transcribe",ASR_SERVICE_TOKEN:"test-only"};
test("audio bounds and format checked",()=>{assert.equal(validWav(wav()),true);assert.equal(validWav(new Uint8Array(10)),false);const bad=wav();bad[24]=0;assert.equal(validWav(bad),false);});
test("unconfigured inference makes no upstream request",async()=>{let called=false;await assert.rejects(()=>transcribe(wav(),{},async()=>{called=true;throw Error();}));assert.equal(called,false);});
test("insecure endpoint rejected",async()=>{await assert.rejects(()=>transcribe(wav(),{...config,ASR_ENDPOINT:"http://inference.example"}));});
test("mock contract preserves actual returned text (NOT a model validation)",async()=>{const data={text:"test fixture only",model:MODEL,revision:REVISION};assert.deepEqual(await transcribe(wav(),config,async()=>Response.json(data)),data);});
test("wrong model, empty, malformed and sensitive responses fail",async()=>{for(const data of [{text:"test",model:"another-model",revision:REVISION},{text:"",model:MODEL,revision:REVISION},{text:"my PIN is 1234",model:MODEL,revision:REVISION}])await assert.rejects(()=>transcribe(wav(),config,async()=>Response.json(data)));await assert.rejects(()=>transcribe(wav(),config,async()=>new Response("not json")));});
test("upstream denial fails with no substitute transcript",async()=>{await assert.rejects(()=>transcribe(wav(),config,async()=>new Response("",{status:403})));});

test("learning banking-codes suggestion retrieves its source",()=>{const a=retrieve("How do I protect my banking codes?","learn",{now});assert.equal(a.status,"ok");assert.equal(a.cards[0].id,"secrets");});

test("upstream oversized stream is cancelled before full buffering",async()=>{let cancelled=false;const body=new ReadableStream<Uint8Array>({start(c){c.enqueue(new Uint8Array(9000));},cancel(){cancelled=true;}});await assert.rejects(()=>transcribe(wav(),config,async()=>new Response(body)));assert.equal(cancelled,true);});
test("cancelled request signal reaches inference transport",async()=>{const controller=new AbortController();controller.abort();await assert.rejects(()=>transcribe(wav(),config,async(_url,init)=>{assert.equal(init?.signal?.aborted,true);throw new Error("cancelled");},controller.signal));});
test("endpoint credentials and query strings are rejected before forwarding",async()=>{for(const endpoint of ["https://name:secret@example.invalid/transcribe","https://example.invalid/transcribe?token=private","not-a-url"]){let called=false;await assert.rejects(()=>transcribe(wav(),{...config,ASR_ENDPOINT:endpoint},async()=>{called=true;return Response.json({});}));assert.equal(called,false);}});
