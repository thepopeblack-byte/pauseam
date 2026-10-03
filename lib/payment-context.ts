// Recognise an explicit report to the bank, not a planned report or mere elapsed time.
export function hasContactedBank(question: string): boolean {
  const text = question.toLowerCase().replace(/[’]/g, "'");
  if (/\b(?:not|never|haven't|have not|didn't|did not)\s+(?:(?:already|yet|previously)\s+)?(?:reported|contacted|complained)\b/.test(text)) return false;
  return /\bi (?:have )?(?:(?:already|previously) )?(?:reported|contacted|complained)\b.{0,45}\bbank\b/.test(text)
    || /\bmy bank complaint (?:is|remains|was)\b.{0,30}\b(?:unresolved|pending|ignored)\b/.test(text);
}
