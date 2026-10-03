import test from "node:test";
import assert from "node:assert/strict";
import { retrieve } from "../lib/safety.ts";
import { contextualGuidance, withGuidance } from "../lib/guidance.ts";
import { hasContactedBank } from "../lib/payment-context.ts";
const now = new Date("2026-10-03T12:00:00Z");
const answer = (q: string) => withGuidance(q, retrieve(q, "before", {now}), now);

test("supplier guidance responds to stated pressure and completed independent confirmation", () => {
  const pressured=answer("A supplier changed bank details and wants ₦5000 today");
  assert.equal(pressured.guidance?.sourceId,"supplier");
  assert.ok(pressured.guidance?.details.some(d=>d.title==="About the deadline"));
  assert.ok(pressured.guidance?.followUp);
  assert.equal(answer("A supplier changed bank details").guidance?.details.length,1);
  assert.equal(answer("A supplier changed bank details. It is not urgent and there is no pressure.").guidance?.details.length,1);
  const confirmed=answer("A supplier changed bank details. I independently confirmed the change using an existing contact.");
  assert.match(confirmed.guidance?.summary||"",/does not authenticate/);
  assert.equal(confirmed.guidance?.followUp,undefined);
  assert.doesNotMatch(confirmed.guidance?.steps.map(s=>s.text).join(" ")||"",/Call your supplier/);
  assert.ok(answer("A supplier changed bank details. I have not independently confirmed the change.").guidance?.followUp);
  assert.doesNotMatch(JSON.stringify(pressured.guidance),/5000/);
});
test("deductions, missing credits and existing complaints get different explanations", () => {
  assert.match(answer("My bank debited the transfer but the recipient has not received it").guidance?.title||"",/debited for/);
  assert.match(answer("My bank deducted money").guidance?.title||"",/explain the deduction/);
  const existing=answer("My bank complaint remains unresolved. I already contacted the bank.");
  assert.match(existing.guidance?.title||"",/existing bank complaint/);
  assert.doesNotMatch(existing.guidance?.steps.map(s=>s.text).join(" ")||"",/Lodge your complaint/);
  assert.match(existing.guidance?.steps[0].text||"",/existing complaint reference/);
});
test("vague payment concerns ask for context without pretending to know what happened", () => {
  const a=answer("I need help with a payment");
  assert.equal(a.guidance?.sourceId,"payment");
  assert.match(a.guidance?.summary||"",/not enough context/);
  assert.equal(a.guidance?.followUp?.choices.length,4);
  const statement=a.guidance?.followUp?.choices.find(c=>c.label==="I paid and the seller disappeared")?.statement;
  assert.equal(answer(`I need help with a payment. ${statement}`).cards[0].id,"report");
  assert.equal(answer("What is a bank?").status,"no_match");
  assert.equal(answer("What is a bank?").guidance,undefined);
});
test("bank contacts, unavailable inference, invented and expired source cards cannot get tailored prose", () => {
  const q="A supplier changed bank details", a=retrieve(q,"before",{now});
  assert.equal(contextualGuidance("GTBank email",retrieve("GTBank email","learn",{now}),now),null);
  assert.equal(contextualGuidance(q,{...a,status:"unavailable",cards:[]},now),null);
  assert.equal(contextualGuidance(q,{...a,status:"no_match",cards:[]},now),null);
  assert.equal(contextualGuidance(q,{...a,cards:[{...a.cards[0],steps:["Invented bank contact"]}]},now),null);
  assert.equal(contextualGuidance(q,{...a,cards:[{...a.cards[0],source:"https://untrusted.example"}]},now),null);
  assert.equal(contextualGuidance(q,a,new Date("2026-11-02")),null);
  assert.equal(contextualGuidance("my PIN is 1234",a,now),null);
});
test("reporting status comes from an explicit statement, never payment dates or time alone", () => {
  for(const q of ["I already contacted the bank", "I reported it to my bank", "My bank complaint remains unresolved", "I have not received money but I reported it to my bank"]) assert.equal(hasContactedBank(q),true,q);
  for(const q of ["I have not contacted the bank", "I haven't yet reported to my bank", "I want to start my bank complaint", "How can I complain to my bank?", "I paid ₦5000 on 03/10/2026"]) assert.equal(hasContactedBank(q),false,q);
});
test("receipt, mistaken-transfer and cybersecurity explanations do not assert fraud or successful recovery", () => {
  assert.match(answer("A buyer sent a receipt as proof of payment").guidance?.summary||"",/cannot establish/);
  assert.match(answer("I transferred money to the wrong recipient").guidance?.summary||"",/does not by itself establish/);
  assert.match(answer("I clicked a suspicious link").guidance?.summary||"",/not proof/);
  assert.match(answer("I sent money and the seller disappeared").guidance?.details.map(d=>d.text).join(" ")||"",/not guaranteed/);
});
