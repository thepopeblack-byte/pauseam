// No audio sent. Checks the real authenticated service identity.
// Store web variables in ignored .dev.vars; never pass the token on the command line.
import {existsSync} from "node:fs";
const envFile=process.argv[2]||".dev.vars";
if(existsSync(envFile))process.loadEnvFile(envFile);
const endpoint=process.env.ASR_ENDPOINT,token=process.env.ASR_SERVICE_TOKEN;
if(!endpoint||!token)throw Error("Set ASR_ENDPOINT and ASR_SERVICE_TOKEN in the ignored web environment file.");
const url=new URL(endpoint);
if(url.protocol!=="https:"||url.username||url.password||url.search||url.hash||!url.pathname.endsWith("/transcribe"))throw Error("Expected an HTTPS /transcribe endpoint without credentials or query strings.");
url.pathname=url.pathname.slice(0,-"transcribe".length)+"health";
try{
 const r=await fetch(url,{headers:{Authorization:"Bearer "+token},redirect:"error",signal:AbortSignal.timeout(15000)});
 if(!r.ok)throw Error("status");
 const body=await r.json();
 if(body.ready!==true||body.model!=="NCAIR1/NigerianAccentedEnglish"||body.revision!=="3c52c6e6c9ec508014a7b9db6a42b503b8930dff")throw Error("identity");
 console.log("Authenticated service is ready with the expected NCAIR model revision. No audio was sent; accuracy is not validated.");
}catch{console.error("Service readiness could not be verified. Check host readiness, token and model revision. No credentials or server response were printed.");process.exitCode=1;}

