import assert from "node:assert/strict";
const base=process.env.BASE_URL||"http://localhost:5173";
const post=(path,body,extra={})=>fetch(base+path,{method:"POST",headers:{"Content-Type":"application/json","Origin":base,...extra},body:JSON.stringify(body)});
let r=await fetch(base+"/api/status");assert.equal(r.status,200);const status=await r.json();assert.equal(status.model,"NCAIR1/NigerianAccentedEnglish");
r=await post("/api/answer",{question:"A seller asks for money before delivery",journey:"before"});let a=await r.json();assert.equal(a.status,"ok");assert.equal(a.model,null);assert.ok(a.cards[0].source.startsWith("https://www.cbn.gov.ng/"));
r=await post("/api/answer",{question:"What is the weather?",journey:"before"});assert.equal((await r.json()).status,"no_match");
r=await post("/api/answer",{question:"my PIN is 1234",journey:"before"});assert.equal(r.status,422);
r=await post("/api/answer",{question:"Please help",journey:"after"});assert.equal((await r.json()).cards[0].id,"report");
r=await post("/api/answer",{question:"bank",journey:"before"},{"Origin":"https://untrusted.example"});assert.equal(r.status,403);
r=await post("/api/answer",{question:"x".repeat(5000),journey:"before"});assert.equal(r.status,400);
r=await fetch(base+"/api/asr",{method:"POST",headers:{"Origin":base,"Content-Type":"audio/wav"},body:new Uint8Array(44)});assert.equal(r.status,400);
r=await fetch(base+"/api/asr",{method:"POST",headers:{"Origin":base,"Content-Type":"text/plain","X-Audio-Consent":"yes"},body:"test"});assert.equal(r.status,415);
for(const path of ["/","/about","/evaluation"]){r=await fetch(base+path);assert.equal(r.status,200);}
for(const language of ["yo","ha","ig"]){r=await post("/api/answer",{question:"supplier",journey:"before",language});assert.equal(r.status,503);}
console.log("15 live HTTP checks passed; no model inference or evaluation records created.");

