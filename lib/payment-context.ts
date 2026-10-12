// Recognise an explicit report to the bank, not a planned report or mere elapsed time.
export function hasContactedBank(question: string): boolean {
  const text = question.toLowerCase().replace(/[’]/g, "'");
  let contacted = false;
  for (const clause of text.split(/[.!?;\n]|\b(?:but|however)\b/)) {
    if (/\b(?:not|never|haven't|have not|didn't|did not)\s+(?:(?:already|yet|previously)\s+)?(?:reported|contacted|complained)\b.{0,45}\bbank\b/.test(clause)) contacted = false;
    else if (/\bi (?:have )?(?:(?:already|previously) )?(?:reported|contacted|complained)\b.{0,45}\bbank\b/.test(clause)
      || /\bmy bank complaint (?:is|remains|was)\b.{0,30}\b(?:unresolved|pending|ignored)\b/.test(clause)) contacted = true;
  }
  return contacted;
}
