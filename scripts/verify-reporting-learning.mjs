import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const origin = new URL(process.argv[2] || "https://pauseam.theblockcapitol.com").origin;
const output = process.argv[3] || "private/secretvm/reporting-learning-feature-check.json";
const checks = [];
for (const [question, expected] of [
  ["I sent money to the wrong person", "mistaken"],
  ["I clicked a phishing link", "account-security"],
  ["My bank deducted money twice", "complaint"],
  ["My bank debited me but the transfer failed", "complaint"],
]) {
  const start = performance.now();
  try {
    const response = await fetch(origin + "/api/answer", { method: "POST", headers: { "content-type": "application/json", origin }, body: JSON.stringify({ question, journey: "before", language: "en" }), signal: AbortSignal.timeout(15000) });
    const data = await response.json();
    checks.push({ name: "Concern route: " + expected, authoredQuestion: question, httpStatus: response.status, card: data.cards?.[0]?.id, model: data.model, elapsedMs: Math.round(performance.now() - start), passed: response.ok && data.status === "ok" && data.cards?.[0]?.id === expected });
  } catch { checks.push({ name: "Concern route: " + expected, passed: false, error: "Request failed or timed out" }); }
}
try {
  const start = performance.now();
  const response = await fetch(origin + "/api/learn", { signal: AbortSignal.timeout(15000) });
  const data = await response.json();
  checks.push({ name: "Dated learning catalog", httpStatus: response.status, count: data.updates?.length, published: data.updates?.map(item => item.published), elapsedMs: Math.round(performance.now() - start), passed: response.ok && data.status === "ok" && data.updates?.length === 3 && data.updates.every(item => new URL(item.source).hostname === "cert.gov.ng" && item.steps.length > 0 && item.choices.length === 2) });
} catch { checks.push({ name: "Dated learning catalog", passed: false, error: "Request failed or invalid catalog" }); }
const result = { recordedAt: new Date().toISOString(), origin, kind: "Authored engineering examples, not participant validation", checks, passed: checks.every(check => check.passed), audioInferenceRun: false, participantRecordsCreated: 0 };
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));
if (!result.passed) process.exitCode = 1;
