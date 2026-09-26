// Opt-in REAL inference only. Supply a consented, non-sensitive mono 16 kHz WAV.
// Does not print or persist the transcript; no evaluation records are seeded.
import {readFile} from "node:fs/promises";
const file=process.argv[2];
if(!file||!process.env.ASR_ENDPOINT||!process.env.ASR_SERVICE_TOKEN)throw Error("Set endpoint/token and supply a consented safe WAV file.");
if(!process.env.ASR_ENDPOINT.startsWith("https://"))throw Error("HTTPS required");
const bytes=await readFile(file);if(bytes.length>960044)throw Error("Audio too large");
const r=await fetch(process.env.ASR_ENDPOINT,{method:"POST",headers:{Authorization:"Bearer "+process.env.ASR_SERVICE_TOKEN,"Content-Type":"audio/wav"},body:bytes,signal:AbortSignal.timeout(45000),redirect:"error"});
if(!r.ok)throw Error("Real inference failed with HTTP "+r.status);
const d=await r.json();
if(d.model!=="NCAIR1/NigerianAccentedEnglish"||d.revision!=="3c52c6e6c9ec508014a7b9db6a42b503b8930dff"||!d.text?.trim())throw Error("Inference response could not be verified");
console.log("Real inference returned nonempty text with the expected model and revision. This is not an accuracy validation.");

