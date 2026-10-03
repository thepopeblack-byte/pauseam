import test from "node:test";
import assert from "node:assert/strict";
import { complaintPlan, reportDraft } from "../lib/reporting.ts";
import { currentSafetyUpdates, SAFETY_UPDATES } from "../lib/updates.ts";
import { retrieve } from "../lib/safety.ts";
const now = new Date("2026-10-02T12:00:00Z");
test("mistaken transfers and security concerns receive relevant actions without a recovery promise", () => {
  assert.equal(
    retrieve("I sent money to the wrong person", "before", { now }).cards[0].id,
    "mistaken",
  );
  const a = retrieve("I clicked a phishing link", "before", { now });
  assert.equal(a.cards[0].id, "account-security");
  assert.equal(a.model, null);
  for (const question of [
    "My bank deducted money twice",
    "My bank debited me but the transfer failed",
  ])
    assert.equal(
      retrieve(question, "before", { now }).cards[0].id,
      "complaint",
    );
});
test("bank first and waiting stages do not direct premature CBN escalation", () => {
  assert.equal(complaintPlan("waiting", now).title, "Follow up with your bank");
  for (const stage of ["first", "waiting"] as const)
    assert.equal(complaintPlan(stage, now).escalate, false);
  assert.equal(complaintPlan("unacknowledged", now).escalate, true);
  assert.equal(complaintPlan("overdue", now).escalate, true);
});
test("expired or future complaint content cannot authorize an escalation", () => {
  for (const date of ["2027-01-01", "2026-09-01"]) {
    const plan = complaintPlan("overdue", new Date(date));
    assert.equal(plan.current, false);
    assert.equal(plan.escalate, false);
  }
});
test("report draft refuses credentials, transaction numbers, email addresses and oversized descriptions", () => {
  for (const question of [
    "my PIN is secret",
    "my OTP is abcdef",
    "my password is secret",
    "transfer 1234567890",
    "contact me@example.com",
    "x".repeat(601),
    "",
  ])
    assert.equal(reportDraft(question, "first", now), null);
});
test("report preserves the user's words without inventing evidence, promises or sending", () => {
  const question = "A seller stopped replying after I paid.";
  const draft = reportDraft(question, "first", now)!;
  assert.ok(draft.includes(question));
  assert.match(draft, /Nothing|not sent/);
  assert.match(draft, /ONLY through the recipient's verified channel/);
  assert.doesNotMatch(draft, /I previously raised/);
  assert.match(reportDraft(question, "overdue", now)!, /I previously raised/);
});
test("learning updates are dated, source linked, and withdrawn at review expiry", () => {
  assert.equal(currentSafetyUpdates(now).length, 3);
  assert.deepEqual(currentSafetyUpdates(new Date("2026-10-10")), []);
  assert.deepEqual(currentSafetyUpdates(new Date("2026-09-01")), []);
  const first = SAFETY_UPDATES[0];
  for (const source of [
    "https://evil.example/cert.gov.ng",
    "https://cert.gov.ng.evil.example/",
    "javascript:alert(1)",
    "http://cert.gov.ng/",
    "https://token@cert.gov.ng/",
  ])
    assert.deepEqual(currentSafetyUpdates(now, [{ ...first, source }]), []);
  assert.deepEqual(
    currentSafetyUpdates(now, [{ ...first, published: "2030-01-01" }]),
    [],
  );
});
