import test from "node:test";
import assert from "node:assert/strict";
import { spokenAnswer, speechChunks } from "../lib/spoken-answer.ts";
import { createSpeechPlayback, type PlaybackState, type SpeechPort } from "../lib/speech-playback.ts";
import { retrieve } from "../lib/safety.ts";
import { withGuidance } from "../lib/guidance.ts";
import { complaintPlan, reportingSteps } from "../lib/reporting.ts";
const now = new Date("2026-10-03T12:00:00Z");
const response = (q: string) => withGuidance(q, retrieve(q, "before", { now }), now);

test("readout uses visible contextual actions and omits private input and collapsed detail", () => {
  const a = response("A supplier changed bank details and wants ₦5000 today");
  const text = spokenAnswer(a, "before", "first");
  assert.ok(text.includes(a.guidance!.title));
  assert.ok(text.includes(a.guidance!.steps[0].text));
  assert.ok(text.includes(a.guidance!.followUp!.question));
  assert.doesNotMatch(text, /5000/);
  assert.ok(!text.includes(a.guidance!.details[0].text));
});
test("bank readout keeps every requested public fact and speaks code symbols and individual digits", () => {
  const a = retrieve("What are GTBank's customer care phone number and email and USSD code?", "learn", { now });
  const text = spokenAnswer(a, "learn", "first");
  assert.match(text, /0 8 0 2 9 0 0 2 9 0 0/);
  assert.match(text, /gtbankmailsupport at gtbank dot com/);
  assert.match(text, /star 7 3 7\s+hash/);
  assert.match(text, /Never share a PIN/);
});
test("changed reporting stage reads current visible plan, not the private report draft", () => {
  const a = retrieve("I already paid and suspect a scam", "after", { now });
  for (const stage of ["first", "waiting", "overdue"] as const) {
    const text = spokenAnswer(a, "after", stage);
    assert.ok(text.includes(complaintPlan(stage).title));
    assert.ok(reportingSteps(stage, a.guidance).every(step => text.includes(step)));
    assert.doesNotMatch(text, /My description/);
  }
});
test("unavailable, sensitive and clarification results cannot read stale success cards", () => {
  const good = response("A supplier changed bank details");
  assert.equal(spokenAnswer({ ...good, status: "unavailable", message: "Unavailable." }, "before", "first"), "Unavailable.");
  assert.equal(spokenAnswer({ ...good, status: "sensitive", message: "Private details cleared." }, "before", "first"), "Private details cleared.");
  const vague = response("I need help with a payment");
  assert.ok(spokenAnswer(vague, "before", "first").includes(vague.clarification!.question));
});
test("speech chunks preserve all words while bounding long utterances", () => {
  const text = Array.from({ length: 200 }, (_, i) => `word${i}`).join(" ");
  const chunks = speechChunks(text);
  assert.ok(chunks.every(c => c.length <= 220));
  assert.equal(chunks.join(" "), text);
  assert.deepEqual(speechChunks(""), []);
});
function fixture() {
  const states: PlaybackState[] = [], spoken: { text: string; events: Parameters<SpeechPort["speak"]>[1] }[] = [];
  let cancelled = 0;
  const playback = createSpeechPlayback({ cancel() { cancelled++; }, speak(text, events) { spoken.push({ text, events }); } }, state => states.push(state), 15);
  return { playback, states, spoken, cancelled: () => cancelled };
}
test("replay cancels the old reply and stale callbacks cannot advance or reset it", () => {
  const f = fixture();
  f.playback.play("First\nSecond");
  f.spoken[0].events.start();
  f.playback.play("New reply");
  const count = f.spoken.length;
  f.spoken[0].events.end(); f.spoken[0].events.error();
  assert.equal(f.spoken.length, count);
  assert.equal(f.states.at(-1), "starting");
  f.spoken[1].events.start(); f.spoken[1].events.end();
  assert.equal(f.states.at(-1), "ended");
  assert.equal(f.cancelled(), 2);
  f.playback.dispose();
});
test("stop and dispose prevent subsequent chunks and component updates", () => {
  const f = fixture(); f.playback.play("One\nTwo");
  f.spoken[0].events.start(); f.playback.stop();
  f.spoken[0].events.end(); assert.equal(f.spoken.length, 1);
  assert.equal(f.states.at(-1), "stopped");
  const count = f.states.length;
  f.playback.dispose(); f.playback.play("Another"); f.spoken[0].events.error();
  assert.equal(f.states.length, count);
});
test("blocked autoplay times out, cancels pending audio and allows a real user replay", async () => {
  const f = fixture(); f.playback.play("One");
  await new Promise(r => setTimeout(r, 25));
  assert.equal(f.states.at(-1), "unavailable");
  f.spoken[0].events.start(); assert.equal(f.states.at(-1), "unavailable");
  f.playback.play("One"); f.spoken[1].events.start();
  assert.equal(f.states.at(-1), "speaking"); f.playback.dispose();
});
test("speech engine exceptions fail safely without retaining a queued reply", () => {
  const states: PlaybackState[] = [];
  const p = createSpeechPlayback({ cancel() {}, speak() { throw new Error("Unavailable device voice"); } }, s => states.push(s));
  p.play("Answer"); assert.equal(states.at(-1), "unavailable"); p.dispose();
});
