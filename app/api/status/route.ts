import {settings,json} from "@/lib/server";
import {MODEL,REVISION,KB_VERSION} from "@/lib/safety";
import {LANGUAGES,TEXT_MODEL,type Language} from "@/lib/models";
import {configuredEndpoint} from "@/lib/asr";
import {textEndpoint} from "@/lib/text-model";
export async function GET(){const s=await settings();return json({model:MODEL,revision:REVISION,kbVersion:KB_VERSION,asrConfigured:!!configuredEndpoint(s),languages:Object.fromEntries(Object.entries(LANGUAGES).map(([key,value])=>[key,{...value,configured:!!configuredEndpoint(s,key as Language),validated:false}])),textModel:TEXT_MODEL,textConfigured:!!textEndpoint(s),officialAPI:"unverified",fineTuning:"not performed",kbEnabled:s.KB_ENABLED!=="false",note:"Configuration is not proof of availability. Live language validation and fluent review are pending."});}
