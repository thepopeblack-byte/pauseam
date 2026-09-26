export async function toWav(blob:Blob):Promise<Uint8Array>{
 const context=new AudioContext();let decoded:AudioBuffer;
 try{decoded=await context.decodeAudioData(await blob.arrayBuffer());}finally{await context.close();}
 if(decoded.duration<.5||decoded.duration>30)throw new Error("Record between half a second and thirty seconds.");
 const frames=Math.floor(decoded.duration*16000),offline=new OfflineAudioContext(1,frames,16000);
 const source=offline.createBufferSource();source.buffer=decoded;source.connect(offline.destination);source.start();
 const rendered=await offline.startRendering(),samples=rendered.getChannelData(0);
 let power=0;for(const n of samples)power+=n*n;if(Math.sqrt(power/samples.length)<.004)throw new Error("The recording is too quiet. Try again closer to the microphone.");
 const bytes=new Uint8Array(44+samples.length*2),d=new DataView(bytes.buffer);
 const word=(offset:number,s:string)=>{for(let i=0;i<s.length;i++)bytes[offset+i]=s.charCodeAt(i);};
 word(0,"RIFF");d.setUint32(4,bytes.length-8,true);word(8,"WAVE");word(12,"fmt ");d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,1,true);d.setUint32(24,16000,true);d.setUint32(28,32000,true);d.setUint16(32,2,true);d.setUint16(34,16,true);word(36,"data");d.setUint32(40,bytes.length-44,true);
 for(let i=0;i<samples.length;i++)d.setInt16(44+i*2,Math.max(-1,Math.min(1,samples[i]))*(samples[i]<0?32768:32767),true);
 return bytes;
}

