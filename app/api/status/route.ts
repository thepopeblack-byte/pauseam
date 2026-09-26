import {settings,json} from "@/lib/server";
import {MODEL,REVISION,KB_VERSION} from "@/lib/safety";
export async function GET(){const s=await settings();return json({model:MODEL,revision:REVISION,kbVersion:KB_VERSION,asrConfigured:s.ASR_ENABLED==="true"&&!!s.ASR_ENDPOINT&&!!s.ASR_SERVICE_TOKEN,kbEnabled:s.KB_ENABLED!=="false",note:"Configured does not mean validated or reachable. No live inference has been claimed."});}

