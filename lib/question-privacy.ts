// Amount/date context is transient. Unclassified numeric identifiers fail closed.
// This is a conservative input boundary, not automatic credential detection.
const months = "jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?";
const amount = "(?:\\d{1,2}(?:,\\d{3}){2}|\\d{1,3},\\d{3}|\\d{1,8})(?:\\.\\d{1,2})?(?:\\s?(?:k|m|thousand|million))?";
const bounded = (body: string) => new RegExp("(?<![\\w.,])(?:" + body + ")(?![\\w]|[.,]\\d)", "gi");
function permittedNumbers(text: string): string {
  let rest = text;
  // Full dates only: refuse impossible days/months instead of matching arbitrary IDs.
  rest = rest.replace(/\b(\d{4})-(\d{2})-(\d{2})\b|\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b/g,
    (match, y, m, d, day, month, year) => {
      const yy = Number(y || year), mm = Number(m || month), dd = Number(d || day);
      const date = new Date(Date.UTC(yy, mm - 1, dd));
      return yy >= 1900 && yy <= 2100 && date.getUTCFullYear() === yy && date.getUTCMonth() === mm - 1 && date.getUTCDate() === dd ? "[date]" : match;
    });
  rest = rest.replace(/\b(\d{1,2})\/(\d{1,2})\b(?![\/\d])/g, (match, day, month) => {
    const dd=Number(day), mm=Number(month), date=new Date(Date.UTC(2000,mm-1,dd));
    return date.getUTCMonth()===mm-1 && date.getUTCDate()===dd ? "[date]" : match;
  });
  rest = rest.replace(bounded("(?:[1-9]|[12]\\d|3[01])(?:st|nd|rd|th)?\\s+(?:of\\s+)?(?:" + months + ")(?:\\s*,?\\s*(?:19|20)\\d{2})?"), "[date]");
  rest = rest.replace(bounded("(?:" + months + ")\\s+(?:[1-9]|[12]\\d|3[01])(?:st|nd|rd|th)?(?:\\s*,?\\s*(?:19|20)\\d{2})?"), "[date]");
  rest = rest.replace(bounded("(?:" + months + ")\\s+(?:19|20)\\d{2}"), "[date]");
  rest = rest.replace(/\b(?:in|during|since|year)\s+(?:19|20)\d{2}\b/gi, "[date]");
  rest = rest.replace(/\b(?:on|since|until|before|after)\s+(?:the\s+)?(?:[1-9]|[12]\d|3[01])(?:st|nd|rd|th)\b/gi, "[date]");
  rest = rest.replace(/\b(?:[01]?\d|2[0-3]):[0-5]\d(?:\s*[ap]m)?\b/gi, "[time]");
  // Menu shortcodes are public information, not a PIN or a transaction string.
  rest = rest.replace(/\*\d{3}#/g, "[USSD menu]");
  rest = rest.replace(bounded("(?:₦|NGN\\s*|naira\\s*|N\\s*|\\$|USD\\s*|GBP\\s*|£|€)\\s*" + amount), "[amount]");
  rest = rest.replace(bounded(amount + "\\s*(?:naira|NGN|dollars|USD|pounds|GBP|euros)"), "[amount]");
  // Natural questions often omit the currency: “I paid 5000 yesterday”.
  rest = rest.replace(new RegExp("\\b(?:paid|pay|sent|send|transferred|transfer|debited|charged|cost|price|amount|payment|withdrew|withdraw|received|credited|took)\\s*(?:(?:of|is|was|me|about)\\s+|[:=]\\s*)?(" + amount + ")(?![\\w]|[.,]\\d)", "gi"),
    (match, value: string) => match.replace(value, "[amount]"));
  rest = rest.replace(new RegExp("\\b(?:asked|asks|asking|requested|requests|wants|want)\\s+(?:me\\s+)?(?:for|to pay)\\s+(" + amount + ")(?![\\w]|[.,]\\d)", "gi"),
    (match, value: string) => match.replace(value, "[amount]"));
  return rest;
}
export function containsPrivateDetails(text: string): boolean {
  if (/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text)) return true;
  if (/\b(?:pin|otp|password|passcode|credential|verification code|banking code|account number|card number|bvn|nin)\s*(?:is|are|was|:|=)\s*\S+/i.test(text)) return true;
  if (/\b(?:pin|otp|password|passcode|account(?:\s+(?:number|no))?|card(?:\s+number)?|bvn|nin|phone(?:\s+number)?|mobile(?:\s+number)?|telephone|date of birth|dob)\s*(?:(?:is|was|are|of|:|=|#)\s*)?\d/i.test(text)) return true;
  if (/\b(?:date of birth|dob)\b[^.!?\n]{0,32}\d/i.test(text)) return true;
  if (/\b(?:zero|one|two|three|four|five|six|seven|eight|nine)(?:[\s,-]+(?:zero|one|two|three|four|five|six|seven|eight|nine)){2,}\b/i.test(text)) return true;
  return /\p{Nd}/u.test(permittedNumbers(text));
}
export function modelQuestion(question: string): string {
  if (containsPrivateDetails(question)) throw new Error("sensitive");
  // The deployed model contract intentionally rejects digits. Amount/date values
  // are unnecessary for checklist relevance; never weaken that host boundary.
  return question.replace(/\d(?:[\d,./:+-]*\d)?/g, "[number omitted]");
}
