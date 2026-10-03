from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
root=Path(__file__).resolve().parents[1]
pdfmetrics.registerFont(TTFont('PA','C:/Windows/Fonts/segoeui.ttf'))
pdfmetrics.registerFont(TTFont('PAB','C:/Windows/Fonts/segoeuib.ttf'))
s=getSampleStyleSheet()
s.add(ParagraphStyle(name='PA',fontName='PA',fontSize=10.2,leading=14,spaceAfter=9,textColor=HexColor('#17243c')))
s.add(ParagraphStyle(name='PATitle',fontName='PAB',fontSize=25,leading=30,spaceAfter=14,textColor=HexColor('#17243c')))
s.add(ParagraphStyle(name='PAHead',fontName='PAB',fontSize=13,leading=18,spaceBefore=10,spaceAfter=6,textColor=HexColor('#244bd4'),keepWithNext=True))
story=[]
def p(t,style='PA'): story.append(Paragraph(t,s[style]))
def link(label,path): return '<link href="https://github.com/thepopeblack-byte/pauseam/blob/main/'+path+'" color="#244bd4"><u>'+escape(label)+'</u></link>'
p('PauseAm integration evidence','PATitle')
p('Ask before you pay. | NAIC 2026 / PS2 | 3 October 2026')
p('PauseAm uses official English ASR to transcribe payment questions and the N-ATLaS text model to check the relevance of reviewed guidance. Users correct and confirm the transcript before requesting next steps. Authenticated model services run on SecretVM, behind the website backend.')
p('Evidence artefacts','PAHead')
items=[('Integration report','output/pdf/02-natlas-integration.pdf','Architecture, model identities, adapters, configuration and screenshots.'),('Live request logs and response samples','submission/evidence/spoken-replies-live-2026-10-03.json','Ten engineering checks, including four N-ATLaS text requests with model revision, trace IDs and measured latency.'),('Authenticated model-host requests','submission/evidence/live-text-inference-2026-10-02.json','Six text requests completed in 6,141-6,754 ms, alongside two input guards.'),('English ASR checks','submission/evidence/freeform-voice-live-2026-10-03.json','Model identity, transcript privacy policy and audio-error responses.'),('Operating application screenshot','submission/evidence/spoken-replies-mobile-v25-2026-10-03.jpg','The English Speak / Type interface on the deployed application.'),('Reproducible verification script','scripts/verify-model-host.mjs','Checks model readiness, pinned identity, real requests and timing.')]
for title,path,detail in items: p(link(title,path)+'<br/>'+escape(detail))
p('Model versions','PAHead')
p('English ASR: NCAIR1/NigerianAccentedEnglish<br/>Revision: 3c52c6e6c9ec508014a7b9db6a42b503b8930dff')
p('Text: NCAIR1/N-ATLaS<br/>Revision: e294476928aca9030e924ca27bb8e085e8581273<br/>Runtime: llama.cpp, Q4_K_M quantized official weights.')
p('<link href="https://pauseam.theblockcapitol.com" color="#244bd4">Live app: pauseam.theblockcapitol.com</link><br/><link href="https://github.com/thepopeblack-byte/pauseam" color="#244bd4">Repository: github.com/thepopeblack-byte/pauseam</link>')
def footer(c,d):
 c.setFont('PA',8);c.setFillColor(HexColor('#526078'));c.drawString(44,26,'PauseAm | N-ATLaS integration | 3 October 2026');c.drawRightString(551,26,str(d.page))
SimpleDocTemplate(str(root/'output/pdf/pauseam-integration-evidence-note.pdf'),pagesize=(595.28,841.89),leftMargin=44,rightMargin=44,topMargin=40,bottomMargin=43,title='PauseAm - N-ATLaS integration evidence',author='PauseAm team').build(story,onFirstPage=footer,onLaterPages=footer)
