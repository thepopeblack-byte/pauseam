"""Keep payment amounts/dates; hide identifiers before returning ASR text.

Recognised words are never converted to guessed numbers. Deterministic guard
tests aren't model validation. Transcripts aren't logged or persisted.
"""
import calendar
import re

PRIVACY_POLICY = "payment-context-v2"
NUMBER_WORDS = r"zero|oh|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth"
SPOKEN_NUMBER = r"\b(?:" + NUMBER_WORDS + r")(?:[\s,-]+(?:and[\s,-]+)?(?:" + NUMBER_WORDS + r"))*\b"
SINGLE_DIGITS = r"\b(?:zero|oh|one|two|three|four|five|six|seven|eight|nine)(?:[\s,-]+(?:zero|oh|one|two|three|four|five|six|seven|eight|nine)){2,}\b"
DISCLOSURE = re.compile(r"\b(?:pin|otp|password|passcode|credential|account number|verification code|banking code|card number|bvn|nin)\s*(?:is|are|was|:|=)\s*\S+", re.I)
IDENTIFIER = re.compile(r"\b(?:pin|otp|password|passcode|account(?:\s+(?:number|no))?|card(?:\s+number)?|bvn|nin|phone(?:\s+number)?|mobile(?:\s+number)?|telephone|date of birth|dob)\s*(?:(?:is|was|are|of|:|=|#)\s*)?(?:₦|NGN\s*|naira\s*)?(?:\d|" + NUMBER_WORDS + r")", re.I)
MONTHS = r"jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?"
AMOUNT = r"(?:[0-9]{1,2}(?:,[0-9]{3}){2}|[0-9]{1,3},[0-9]{3}|[0-9]{1,8})(?:\.[0-9]{1,2})?(?:\s?(?:k|m|thousand|million))?"
PAYMENT = r"paid|pay|sent|send|transferred|transfer|debited|debit|charged|charge|cost|price|amount|payment|transaction|withdrew|withdraw|received|credited|took|lost"
CURRENCY = r"naira|NGN|dollars|USD|pounds|GBP|euros"


def bounded(body):
    return re.compile(r"(?<![\w.,])(?:" + body + r")(?![\w]|[.,]\d)", re.I)


def permitted_spans(text):
    spans = []
    for m in re.finditer(r"\b([0-9]{4})-([0-9]{2})-([0-9]{2})\b|\b([0-9]{1,2})[/.\-]([0-9]{1,2})[/.\-]([0-9]{4}|[0-9]{2})\b", text):
        y, mo, d, day, month, year = m.groups()
        yy = int(y or year) + (2000 if not y and len(year) == 2 else 0)
        mm, dd = int(mo or month), int(d or day)
        if 1900 <= yy <= 2100 and 1 <= mm <= 12 and 1 <= dd <= calendar.monthrange(yy, mm)[1]:
            spans.append(m.span())
    for m in re.finditer(r"\b([0-9]{1,2})/([0-9]{1,2})\b(?![/\d])", text):
        dd, mm = map(int, m.groups())
        if 1 <= mm <= 12 and 1 <= dd <= calendar.monthrange(2000, mm)[1]:
            spans.append(m.span())
    patterns = [
        bounded(r"(?:[1-9]|[12][0-9]|3[01])(?:st|nd|rd|th)?\s+(?:of\s+)?(?:" + MONTHS + r")(?:\s*,?\s*(?:19|20)[0-9]{2})?"),
        bounded(r"(?:" + MONTHS + r")\s+(?:[1-9]|[12][0-9]|3[01])(?:st|nd|rd|th)?(?:\s*,?\s*(?:19|20)[0-9]{2})?"),
        bounded(r"(?:" + MONTHS + r")\s+(?:19|20)[0-9]{2}"),
        re.compile(r"\b(?:in|during|since|year)\s+(?:19|20)[0-9]{2}\b", re.I),
        re.compile(r"\b(?:on|since|until|before|after)\s+(?:the\s+)?(?:[1-9]|[12][0-9]|3[01])(?:st|nd|rd|th)\b", re.I),
        re.compile(r"\b(?:[01]?[0-9]|2[0-3]):[0-5][0-9](?:\s*[ap]m)?\b", re.I),
        re.compile(r"\*[0-9]{3}#"),
        bounded(r"(?:₦|NGN\s*|naira\s*|N\s*|\$|USD\s*|GBP\s*|£|€)\s*" + AMOUNT),
        bounded(AMOUNT + r"\s*(?:" + CURRENCY + r")"),
        re.compile(r"\b(?:" + PAYMENT + r")\s*(?:(?:of|is|was|me|about)\s+|[:=]\s*)?(" + AMOUNT + r")(?![\w]|[.,]\d)", re.I),
        re.compile(r"\b(?:asked|asks|asking|requested|requests|wants|want)\s+(?:me\s+)?(?:for|to pay)\s+(" + AMOUNT + r")(?![\w]|[.,]\d)", re.I),
        # Preserve the model's spoken wording; don't guess the numeric value.
        re.compile(r"\b(?:" + PAYMENT + r")\s*(?:(?:of|is|was|me|about)\s+|[:=]\s*)?(?:" + SPOKEN_NUMBER + r")", re.I),
        re.compile(r"(?:" + SPOKEN_NUMBER + r")\s*(?:" + CURRENCY + r")\b", re.I),
        re.compile(r"\b(?:on|since|until|before|after)\s+(?:the\s+)?(?:" + SPOKEN_NUMBER + r")\s+(?:of\s+)?(?:" + MONTHS + r")\b", re.I),
        re.compile(r"\b(?:" + MONTHS + r")\s+(?:the\s+)?(?:" + SPOKEN_NUMBER + r")", re.I),
    ]
    for pattern in patterns:
        spans.extend(m.span() for m in pattern.finditer(text))
    return spans


def public_transcript(text):
    if not isinstance(text, str) or not text.strip() or len(text) > 1000:
        raise ValueError("No usable transcript")
    if DISCLOSURE.search(text) or IDENTIFIER.search(text) or re.search(r"\b(?:date of birth|dob)\b[^.!?\n]{0,32}\d", text, re.I):
        raise ValueError("Possible private details: transcript discarded")
    text = text.strip()
    safe = re.sub(r"[\w.+-]+@[\w.-]+\.[a-z]{2,}", "[private detail removed]", text, flags=re.I)
    safe = re.sub(SINGLE_DIGITS, "[number removed]", safe, flags=re.I)
    spans = permitted_spans(safe)
    def hide(match):
        return match.group() if any(start <= match.start() and match.end() <= end for start, end in spans) else "[number removed]"
    # Separate tokens: an amount and date must not merge across spaces.
    safe = re.sub(r"\d(?:[\d,./:+-]*\d)?|" + SPOKEN_NUMBER, hide, safe, flags=re.I)
    safe = re.sub(r"(?:\[number removed\][\s,./:+-]*){2,}", "[number removed] ", safe).strip()
    meaningful = re.sub(r"\[(?:number|private detail) removed\]", "", safe)
    if not re.search(r"[a-zA-Z]", meaningful):
        raise ValueError("No usable transcript")
    return safe, safe != text
