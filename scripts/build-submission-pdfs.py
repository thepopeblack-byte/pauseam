
from pathlib import Path
import re
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate,Paragraph
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"output/pdf";OUT.mkdir(parents=True,exist_ok=True)
fonts=[(Path("C:/Windows/Fonts/segoeui.ttf"),Path("C:/Windows/Fonts/segoeuib.ttf")),
       (Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))]
regular,bold=next((pair for pair in fonts if all(p.exists() for p in pair)),(None,None))
if regular is None:raise SystemExit("Install Segoe UI on Windows or DejaVu Sans on Linux to render these PDFs.")
pdfmetrics.registerFont(TTFont("Segoe",str(regular)))
pdfmetrics.registerFont(TTFont("SegoeBold",str(bold)))
pdfmetrics.registerFontFamily("Segoe",normal="Segoe",bold="SegoeBold",italic="Segoe",boldItalic="SegoeBold")
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name="BodyPA",fontName="Segoe",fontSize=10,leading=13,spaceAfter=6,textColor=HexColor("#153640")))
styles.add(ParagraphStyle(name="TitlePA",fontName="SegoeBold",fontSize=25,leading=31,spaceAfter=20,textColor=HexColor("#075d51"),keepWithNext=True))
styles.add(ParagraphStyle(name="HeadPA",fontName="SegoeBold",fontSize=14,leading=20,spaceBefore=12,spaceAfter=7,textColor=HexColor("#075d51"),keepWithNext=True))
def page(c,doc):
 c.setStrokeColor(HexColor("#c5d3d8"));c.line(46,795,549,795)
 c.setFont("SegoeBold",9);c.setFillColor(HexColor("#075d51"));c.drawString(46,808,"PauseAm  /  Ask before you pay.")
 c.setFont("Segoe",8);c.setFillColor(HexColor("#49636e"));c.drawString(46,30,"NAIC 2026 · Review copy · Not submitted · 1 October 2026");c.drawRightString(549,30,str(doc.page))
def inline(s):
 s=escape(s)
 s=re.sub(r"(https://[^\s]+)",lambda m:'<link href="'+m[0]+'" color="#075d51">'+m[0]+"</link>",s)
 s=re.sub(r"\*\*(.*?)\*\*",r"<b>\1</b>",s)
 return s.replace(chr(96),"")
jobs=[
("submission/02-integration/integration-evidence.md","02-natlas-integration.pdf",["submission/02-integration/access-and-models.md"]),
("submission/03-validation/validation-report.md","03-validation-status.pdf",[]),
("submission/04-technical/technical-documentation.md","04-technical-documentation.pdf",[]),
("submission/06-team/team-profile.md","06-team-profile-review.pdf",[]),
("submission/07-registration/private-checklist.md","07-registration-checklist.pdf",[])]
for src,name,extras in jobs:
 story=[]
 for path in [src]+extras:
  text=re.sub(r"(?m)^(#{1,3} .+)$",r"\n\1\n",(ROOT/path).read_text(encoding="utf-8"))
  for b in re.split(r"\n\s*\n",text):
   b=b.strip()
   if not b:continue
   if b.startswith("# "):style="TitlePA";b=b[2:]
   elif b.startswith("## "):style="HeadPA";b=b[3:]
   else:style="BodyPA"
   story.append(Paragraph(inline(b.replace("\n"," ")),styles[style]))
 SimpleDocTemplate(str(OUT/name),pagesize=(595.28,841.89),leftMargin=46,rightMargin=46,topMargin=64,bottomMargin=55,title="PauseAm — "+name,author="PauseAm team; status prepared with Codex").build(story,onFirstPage=page,onLaterPages=page)
 print(name)
