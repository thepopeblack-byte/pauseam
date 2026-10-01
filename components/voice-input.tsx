"use client";
import {useEffect,useRef,useState} from "react";
import {Mic,Square,Trash2} from "lucide-react";
import {Checkbox} from "@/components/ui/checkbox";
import {toWav} from "@/lib/audio";
import {MODEL,MODEL_URL,REVISION,wordErrors} from "@/lib/safety";
import {saveTrial,type Trial} from "@/lib/evaluation";
export function VoiceInput({onTranscript,testing=false,reference="",journey="before"}:{onTranscript:(text:string,model:string)=>void;testing?:boolean;reference?:string;journey?:"before"|"after"|"learn"}){
 const [consent,setConsent]=useState(false),[configured,setConfigured]=useState<boolean|null>(null),[recording,setRecording]=useState(false),[busy,setBusy]=useState(false),[audio,setAudio]=useState<Blob|null>(null),[url,setUrl]=useState(""),[message,setMessage]=useState("");
 const operation=useRef(0);
 const testingRef=useRef(testing); testingRef.current=testing;
 const recorder=useRef<MediaRecorder|null>(null),stream=useRef<MediaStream|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null),alive=useRef(true),cancel=useRef<AbortController|null>(null);
 useEffect(()=>{alive.current=true;fetch("/api/status",{signal:AbortSignal.timeout(8000)}).then(r=>r.json()).then(d=>{if(alive.current)setConfigured((d as {asrConfigured?:boolean}).asrConfigured===true);}).catch(()=>{if(alive.current)setConfigured(false);});return()=>{alive.current=false;operation.current++;cancel.current?.abort();if(timer.current)clearTimeout(timer.current);if(recorder.current?.state==="recording")recorder.current.stop();stream.current?.getTracks().forEach(t=>t.stop());};},[]);
 useEffect(()=>{if(!audio){setUrl("");return;}const value=URL.createObjectURL(audio);setUrl(value);return()=>URL.revokeObjectURL(value);},[audio]);
 function stop(){if(recorder.current?.state==="recording")recorder.current.stop();stream.current?.getTracks().forEach(t=>t.stop());if(timer.current)clearTimeout(timer.current);setRecording(false);}
 async function record(){
  setMessage("");setAudio(null);
  if(!consent)return;
  if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==="undefined"){setMessage("Recording is not supported here. Use a current browser over HTTPS, or type your question.");return;}
  setBusy(true);const id=++operation.current;
  try{const media=await navigator.mediaDevices.getUserMedia({audio:true});if(!alive.current||operation.current!==id){media.getTracks().forEach(t=>t.stop());return;}stream.current=media;const rec=new MediaRecorder(media);recorder.current=rec;const chunks:Blob[]=[];rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};rec.onerror=()=>{stop();setMessage("Recording failed. Please type instead.");};rec.onstop=()=>{if(alive.current)setAudio(new Blob(chunks,{type:rec.mimeType}));chunks.length=0;};rec.start();setRecording(true);timer.current=setTimeout(stop,28000);}
  catch{stream.current?.getTracks().forEach(t=>t.stop());if(alive.current&&operation.current===id)setMessage("Microphone access was not available. You can type instead.");}finally{if(alive.current&&operation.current===id)setBusy(false);}
 }
 async function send(){
  if(!audio||!consent||busy)return;setBusy(true);setMessage("");const started=performance.now(),id=++operation.current,saveMeasurement=testingRef.current;cancel.current=new AbortController();const controller=cancel.current;
  const trial:Trial={kind:"asr",journey,outcome:"failed",latencyMs:0};
  try{const bytes=await toWav(audio);if(!alive.current||operation.current!==id||controller.signal.aborted){bytes.fill(0);return;}const timeout=setTimeout(()=>controller.abort(),50000);let response:Response;
   try{response=await fetch("/api/asr",{method:"POST",headers:{"Content-Type":"audio/wav","X-Audio-Consent":"yes"},body:bytes as BodyInit,signal:controller.signal});}finally{clearTimeout(timeout);bytes.fill(0);}
   const data=await response.json() as {error?:string;text:string;model:string;revision:string};if(!response.ok)throw new Error(data.error||"Speech recognition is unavailable.");
   if(data.model!==MODEL||data.revision!==REVISION||typeof data.text!=="string")throw new Error("The model identity could not be verified.");
   trial.outcome="ok";if(reference)Object.assign(trial,wordErrors(reference,data.text));if(alive.current&&operation.current===id&&!controller.signal.aborted)onTranscript(data.text,data.model);
  }catch(e){if(alive.current&&operation.current===id)setMessage(e instanceof Error?e.message:"No transcript was available. Type instead.");}
  finally{trial.latencyMs=Math.min(120000,Math.round(performance.now()-started));if(saveMeasurement&&testingRef.current&&alive.current&&operation.current===id&&!saveTrial(trial))setMessage("Test result could not be saved on this device.");if(alive.current&&operation.current===id){setBusy(false);setAudio(null);}}
 }
 return <div><label className="consent"><Checkbox checked={consent} disabled={busy||recording} onCheckedChange={v=>{setConsent(v===true);setAudio(null);}}/>I agree to send this recording to the configured N-ATLaS service for transcription. It is processed in memory, not saved by this app. I will not speak private details.</label>
 <button className="voice-button" disabled={!consent||busy||configured!==true} onClick={recording?stop:record}>{recording?<Square/>:<Mic/>}<span>{recording?"Stop recording":busy?"Processing…":"Speak your question"}<small>{configured===null?"Checking voice availability…":configured?"Nigerian-accented English · up to 28 seconds":"Voice unavailable · typed questions still work"}</small></span></button>
 {audio&&<div className="content-panel"><p>Listen first. If you spoke a secret, discard this recording. Never submit it.</p><audio controls src={url} style={{width:"100%"}}/><div className="chips"><button disabled={busy} onClick={send}>Transcribe this recording</button><button disabled={busy} onClick={()=>setAudio(null)}><Trash2 size={14}/> Discard</button></div></div>}
 {busy&&<button className="secondary" onClick={()=>{operation.current++;cancel.current?.abort();stream.current?.getTracks().forEach(t=>t.stop());setBusy(false);setAudio(null);setMessage("Cancelled. No transcript will be used.");}}>Cancel voice request</button>}
 {message&&<p role="alert" className="notice">{message}</p>}
 <p className="microcopy">ASR: <a href={MODEL_URL} target="_blank" rel="noreferrer">{MODEL}</a>. No substitute model. <a href="/about">Data & model details</a></p></div>;
}





