"""Redact numeric details before any transcript leaves the inference service.

These deterministic fixtures/guards are not model validation. No original
transcript is logged or persisted. Explicit credential disclosures fail closed.
"""
import re

PRIVACY_POLICY = "numbers-redacted-v1"
NUMBER_WORDS = r"zero|oh|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth"
DISCLOSURE = re.compile(r"\b(?:pin|otp|password|passcode|credential|account number|verification code|banking code)\s*(?:is|are|:|=)\s*\S+", re.I)

def public_transcript(text):
    if not isinstance(text, str) or not text.strip() or len(text) > 1000:
        raise ValueError("No usable transcript")
    if DISCLOSURE.search(text):
        raise ValueError("Possible private details: transcript discarded")
    # Do not try to distinguish a bank account from an amount using its length.
    # Hide every digit run (including Unicode digits) and spoken-number sequence.
    redacted = re.sub(r"[\w.+-]+@[\w.-]+\.[a-z]{2,}", "[private detail removed]", text, flags=re.I)
    redacted = re.sub(r"\d(?:[\d\s,./:+-]*\d)?", "[number removed]", redacted)
    redacted = re.sub(r"\b(?:" + NUMBER_WORDS + r")(?:[\s,-]+(?:and[\s,-]+)?(?:" + NUMBER_WORDS + r"))*\b", "[number removed]", redacted, flags=re.I)
    redacted = re.sub(r"(?:\[number removed\][\s,./:+-]*){2,}", "[number removed] ", redacted).strip()
    meaningful = re.sub(r"\[(?:number|private detail) removed\]", "", redacted)
    if not re.search(r"[a-zA-Z]", meaningful):
        raise ValueError("No usable transcript")
    return redacted, redacted != text.strip()
