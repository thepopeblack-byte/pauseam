"""Reconcile LOCAL drafts only; never accesses or submits ONDI.

Keep verified field limits and human facts from the canonical draft file.
Only explicitly reviewed answers below change; recompute every character count.
This script does not turn owner/engineering checks into participant validation.
"""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
file = root / "submission/ondi-answer-drafts.json"
data = json.loads(file.read_text(encoding="utf-8"))
answers = json.loads(r'''{
  "Describe the artefact you are building (or have built)": "PauseAm is a mobile payment companion with English voice/text questions, bank-first reporting guidance and scam lessons. Official Nigerian-accented-English ASR on our SecretVM produces a transcript for correction and confirmation. The pinned N-ATLaS CPU text model selects relevant reviewed guidance; authored actions remain source-grounded. Voice questions receive device-read replies with text and replay/stop; typed replies stay silent. Version 25 passed 80 application tests and ten live backend checks; four checks used genuine N-ATLaS requests. The owner confirms playback works; these are not participant interactions. Bank contacts use official sources. Report drafts are reviewed and sent by users. No money is moved, account authenticated or recovery guaranteed. Other languages are paused; official API and fine-tuning are unverified. Official-ASR-service eligibility, 50 documented interactions and a real demo video remain pending.",
  "PS2: Describe the end-to-end user journey, from voice input to service delivered": "Current English flow: choose Speak; consent to audio processing; record a short question in your own words; listen or discard; transcribe through the authenticated official NCAIR ASR weights; verify returned model identity; correct and confirm the transcript; send the question. The pinned N-ATLaS CPU text model checks relevance against current allowlisted source cards. Users receive situation-specific authored guidance or a clarification, with a device-read reply, text below and replay/stop. Type produces a silent text reply. No official N-ATLaS TTS resource was found; device readout is not claimed as N-ATLaS speech generation. Eight-bank contact facts and urgent bank-first actions use direct reviewed sources. Missing inference or expired sources fail safely. Report drafts remain private for user review and sending; police reports, court filings and paid case handling are not automated. Amounts/dates are accepted in text/correction; raw speech numbers are redacted. No raw audio retention by default, PINs, OTPs, passwords, full credentials, safety verdicts or recovery promises. Version 25 passed 80 tests and ten live backend checks, including four genuine text-model requests. The owner confirms audio controls and silent text; this is not participant validation. Other languages are paused. Official-ASR-service qualification, official API, fine-tuning, 50 documented interactions and the MP4 remain unresolved.",
  "PS2: User-acquisition plan for reaching 1,000 users within 3 months of award": "The reported 200+ willing testers are prospective, not completed users. First conduct discovery and at least 50 consented observed English voice interactions; measure comprehension, corrections, failures and useful completion. If evidence supports the product, post-award acquisition targets are 200 users in month one, 300 additional users in month two and 500 in month three through student/small-business partners and voluntary sharing. These are projections, not traction. Measure return use without retaining private questions. Other languages need compute and fluent review. Keep the shared pilot licence guard and secure permission before exceeding 1,000 active users in a rolling 30 days. Proposed revenue is optional human recovery-case support: a disclosed support fee plus an agreed percentage of funds actually recovered, with a Nigerian legal partner the owner reports is available. Counsel would handle legal advice and court work; bank/eligible CBN and police reporting depend on the case. Verify the partner and written fee terms, establish secure intake and obtain commercial N-ATLaS permission before paid launch. Recovery is not guaranteed; no paid service, recovery outcome or revenue is claimed. First-use guidance stays free. Pricing, costs and willingness-to-pay require validation."
}''')

for draft in data["drafts"]:
    if draft["field"] in answers:
        draft["answer"] = answers[draft["field"]]
    draft["characters"] = len(draft["answer"])
    limit = draft["verifiedLimit"]
    draft["withinLimit"] = None if limit is None else draft["characters"] <= limit
    if draft["withinLimit"] is False:
        raise SystemExit("Known character limit exceeded: " + draft["field"])

data["scope"] = "Local English-scope drafts, 3 October 2026. Version 25 engineering/owner evidence and proposed recovery-support revenue. Only actual page 1-2 limits are verified; unknown limits remain null. No ONDI fields edited or submitted. Final human evidence and portal review remain required."
data["selections"].update({
    "completedInteractions": 0,
    "languagesProvenByLiveVoice": ["Nigerian-accented English (owner engineering check only; participant accuracy review pending)"],
    "buildStatus": "Live version 25 English ASR/text with device readout; owner confirms replay/stop and silent text. Official-service eligibility, documented human validation and video remain pending. No form capability checkbox selected by this script.",
})
file.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Local drafts reconciled; all known character limits passed. Unknown limits not asserted.")
