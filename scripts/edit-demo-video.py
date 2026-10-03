"""Reproducible edit of owner-supplied real footage; never creates app responses.

Requires FFmpeg/FFprobe, Pillow, numpy, and an isolated edge-tts 7.2.8 interpreter.
The original recording is read-only; original audio is not copied into outputs.
Use --stage narrate, then --stage render. Inputs and generated speech stay local
except the authored nonsensitive narration text sent to Microsoft Edge TTS.
"""
import argparse, hashlib, json, re, subprocess, sys, textwrap, wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLAN = json.loads((ROOT/'submission/05-video/edit-plan.json').read_text('utf-8'))
WORK = ROOT/'private/video-edit'
OUT = ROOT/'output/video'
WORK.mkdir(parents=True,exist_ok=True)
OUT.mkdir(parents=True,exist_ok=True)
parser=argparse.ArgumentParser()
parser.add_argument('--stage', choices=['narrate','render'], required=True)
parser.add_argument('--source', type=Path)
parser.add_argument('--tts-python', type=Path, default=WORK/'edge-venv/Scripts/python.exe')
args=parser.parse_args()
DURATION=sum(c['duration'] for c in PLAN['clips'])

def run(cmd):
    subprocess.run([str(x) for x in cmd],check=True)

def probe(path):
    return json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(path)]))

def seconds(stamp):
    h,m,s=stamp.replace(',','.').split(':')
    return int(h)*3600+int(m)*60+float(s)

def timecode(t,ass=False):
    if ass:
        cs=round(t*100);return f'{cs//360000}:{cs//6000%60:02d}:{cs//100%60:02d}.{cs%100:02d}'
    ms=round(t*1000);return f'{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d},{ms%1000:03d}'

if args.stage=='narrate':
    import numpy as np
    clips=[];cues=[]
    for i,item in enumerate(PLAN['utterances']):
        stem=WORK/f'narration-{i:02d}'
        mp3=stem.with_suffix('.mp3');srt=stem.with_suffix('.srt');wav=stem.with_suffix('.wav')
        if not mp3.exists() or not srt.exists():
            run([args.tts_python,'-m','edge_tts','--voice',PLAN['narration']['voice'],
                 '--rate='+PLAN['narration']['rate'],'--text',item['text'],
                 '--write-media',mp3,'--write-subtitles',srt])
        original=float(probe(mp3)['format']['duration'])
        end=PLAN['utterances'][i+1]['start'] if i+1<len(PLAN['utterances']) else DURATION
        room=end-item['start']-.35
        speed=max(1,original/room)
        if speed>1.22:
            raise RuntimeError(f'Narration {i} needs shortening: {original:.2f}s in {room:.2f}s')
        run(['ffmpeg','-y','-hide_banner','-loglevel','error','-i',mp3,
             '-af',f'atempo={speed:.6f}','-ar','48000','-ac','1','-c:a','pcm_s16le',wav])
        with wave.open(str(wav),'rb') as f:
            data=np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').astype(np.float32)/32768
        clips.append((item['start'],data))
        for block in re.split(r'\n\s*\n',srt.read_text('utf-8').strip()):
            lines=block.splitlines()
            if len(lines)<3:continue
            first,last=lines[1].split(' --> ')
            text=' '.join(lines[2:])
            for spoken,written in [('Pause am','PauseAm'),('N atlas','N-ATLaS'),('N C A I R','NCAIR'),('A S R','ASR'),('P I Ns','PINs'),('U B A','UBA'),('G T Bank','GTBank'),('C B N','CBN')]:
                text=text.replace(spoken,written)
            cues.append({'start':item['start']+seconds(first)/speed,
                         'end':min(end-.12,item['start']+seconds(last)/speed),'text':text})
        print(f'Narration {i+1}/{len(PLAN["utterances"])}: {original:.1f}s; edit speed {speed:.3f}',flush=True)
    cues.sort(key=lambda c:c['start'])
    for cue,nxt in zip(cues,cues[1:]):
        cue['end']=min(cue['end'],nxt['start']-.01)
        if cue['end']<=cue['start']:raise RuntimeError('Invalid caption interval')
    mixed=np.zeros(round(DURATION*48000),dtype=np.float32)
    for offset,data in clips:
        start=round(offset*48000)
        assert start+len(data)<=len(mixed)
        mixed[start:start+len(data)]+=data
    assert np.max(np.abs(mixed))<1.2
    with wave.open(str(WORK/'narration-timeline.wav'),'wb') as f:
        f.setnchannels(1);f.setsampwidth(2);f.setframerate(48000)
        f.writeframes((np.clip(mixed,-1,1)*32767).astype('<i2').tobytes())
    (WORK/'narration-cues.json').write_text(json.dumps(cues,indent=2)+'\n','utf-8')
    (OUT/'pauseam-demo-captions.srt').write_text('\n\n'.join(f'{i+1}\n{timecode(c["start"])} --> {timecode(c["end"])}\n'+ '\n'.join(textwrap.wrap(c['text'],60)) for i,c in enumerate(cues))+'\n','utf-8')
    sys.exit(0)

if not args.source or not args.source.is_file():
    raise SystemExit('--source must name the actual recording')
from PIL import Image,ImageDraw,ImageFont
fonts=Path('C:/Windows/Fonts')
def font(size,bold=False):return ImageFont.truetype(str(fonts/('segoeuib.ttf' if bold else 'segoeui.ttf')),size)
def wrapped(draw,text,xy,face,width,fill,linegap=12):
    x,y=xy
    for paragraph in text.split('\n'):
        line=''
        for word in paragraph.split():
            test=(line+' '+word).strip()
            if draw.textlength(test,font=face)>width and line:
                draw.text((x,y),line,font=face,fill=fill);y+=face.size+linegap;line=word
            else:line=test
        if line:draw.text((x,y),line,font=face,fill=fill);y+=face.size+linegap
    return y

for key,chapter in PLAN['chapters'].items():
    im=Image.new('RGB',(1920,1080),'#f5f7fb');d=ImageDraw.Draw(im)
    d.rounded_rectangle((88,62,160,134),radius=18,fill='#10182f')
    d.rounded_rectangle((108,80,120,116),radius=4,outline='#d9edb6',width=3)
    d.rounded_rectangle((129,80,141,116),radius=4,outline='#d9edb6',width=3)
    d.text((180,63),'PauseAm',font=font(36,True),fill='#10182f')
    d.text((182,109),'Ask before you pay.',font=font(22),fill='#526179')
    d.text((92,218),chapter['eyebrow'],font=font(24,True),fill='#3150d9')
    title_end=wrapped(d,chapter['title'],(88,260),font(68,True),1120,'#10182f',8)
    desc_end=wrapped(d,chapter['description'],(92,title_end+26),font(31),1040,'#43536b',11)
    y=max(554,desc_end+30)
    for point in chapter['points']:
        d.rounded_rectangle((94,y+13,103,y+22),radius=3,fill='#3150d9')
        y=wrapped(d,point,(124,y),font(26),960,'#253651',9)+12
    d.rounded_rectangle((78,782,1246,998),radius=24,fill='#e9edf7')
    d.text((99,798),'DEMO NARRATION',font=font(18,True),fill='#526179')
    d.rounded_rectangle((1336,64,1822,1014),radius=40,fill='#d6deed')
    d.text((93,1018),'Recorded product · selected takes · original audio removed',font=font(21),fill='#59677d')
    d.text((93,1048),'Narrator: Microsoft en-NG-AbeoNeural · not N-ATLaS TTS',font=font(21),fill='#59677d')
    im.save(WORK/f'canvas-{key}.png')

segments=[]
for i,c in enumerate(PLAN['clips']):
    dest=WORK/f'edited-{i:02d}.mp4'
    if dest.exists():segments.append(dest);continue
    base=['ffmpeg','-y','-hide_banner','-loglevel','error','-ss',c['start'],'-i',args.source,
          '-loop','1','-i',WORK/f'canvas-{c["chapter"]}.png']
    picture='[0:v]crop=1080:2170:0:100,scale=-2:934,fps=30,setsar=1'
    if c.get('freeze'):picture+=',trim=end_frame=1,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration='+str(c['duration'])
    picture+='[phone];[1:v][phone]overlay=1346:72:shortest=1,format=yuv420p[v]'
    run(base+['-filter_complex_threads','2','-filter_complex',picture,'-map','[v]','-an','-t',c['duration'],
              '-c:v','libx264','-crf','19','-preset','veryfast','-threads','4','-r','30',dest])
    segments.append(dest)
    print(f'Rendered scene {i+1}/{len(PLAN["clips"])}',flush=True)

listing=WORK/'edit-concat.txt'
listing.write_text('\n'.join("file '"+p.as_posix()+"'" for p in segments)+'\n','utf-8')
run(['ffmpeg','-y','-hide_banner','-loglevel','error','-f','concat','-safe','0','-i',listing,
     '-c','copy',WORK/'assembled-muted.mp4'])
cues=json.loads((WORK/'narration-cues.json').read_text('utf-8'))
ass='''[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Narration,Segoe UI,32,&H002F1810,&H002F1810,&H00FFFFFF,&H00000000,0,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
for cue in cues:
    lines=textwrap.wrap(cue['text'],58)
    if len(lines)>4:raise RuntimeError('Caption exceeds panel')
    text=r'{\pos(100,843)}'+r'\N'.join(lines)
    ass+=f'Dialogue: 0,{timecode(cue["start"],True)},{timecode(cue["end"],True)},Narration,,0,0,0,,{text}\n'
(WORK/'narration.ass').write_text(ass,'utf-8')
run(['ffmpeg','-y','-hide_banner','-loglevel','error','-i',WORK/'assembled-muted.mp4',
     '-i',WORK/'narration-timeline.wav','-map','0:v:0','-map','1:a:0',
     '-vf','ass=private/video-edit/narration.ass',
     '-af','loudnorm=I=-16:TP=-1.5:LRA=11','-c:v','libx264','-crf','19','-preset','veryfast',
     '-threads','4','-c:a','aac','-b:a','160k','-ar','48000','-movflags','+faststart',
     '-t',DURATION,OUT/'pauseam-demo-review.mp4'])
result=probe(OUT/'pauseam-demo-review.mp4')
receipt={'kind':'Real footage edit, not model-validation data','sourceSha256':hashlib.sha256(args.source.read_bytes()).hexdigest(),
         'outputSha256':hashlib.sha256((OUT/'pauseam-demo-review.mp4').read_bytes()).hexdigest(),
         'duration':float(result['format']['duration']),'narration':PLAN['narration'],
         'originalAudioRemoved':True,'appResponsesReplaced':False,'playbackSpeed':1,
         'trimPlan':'submission/05-video/edit-plan.json','closingFrameHeldSeconds':18,
         'humanFullPlaybackReview':'pending','applicationSubmitted':False}
(OUT/'pauseam-demo-edit-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n','utf-8')
print(json.dumps(receipt,indent=2),flush=True)
