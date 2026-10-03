import type { Answer, Journey } from "./safety.ts";
import { complaintPlan, reportingSteps, type ComplaintStage } from "./reporting.ts";

// Read the visible answer, never the user's question, transcript or report draft.
export function spokenAnswer(answer: Answer, journey: Journey, stage: ComplaintStage): string {
  if (answer.status !== "ok") {
    return [answer.message, answer.clarification?.question].filter(Boolean).join("\n");
  }
  const lines: string[] = [];
  if (answer.bankInfo) {
    lines.push(answer.bankInfo.bank);
    for (const fact of answer.bankInfo.facts) {
      const value = fact.label === "Customer-care phone" || fact.label === "USSD menu"
        ? fact.value.replace(/\d/g, "$& ").replace(/\*/g, "star ").replace(/#/g, " hash").replace(/[-+]/g, " ")
        : fact.value.replace(/@/g, " at ").replace(/\./g, " dot ");
      lines.push(`${fact.label}: ${value}`);
    }
    lines.push("Confirm these details on the linked official bank page. Never share a PIN, OTP or password.");
  }
  if (journey === "after") {
    const plan = complaintPlan(stage);
    if (answer.guidance) lines.push(answer.guidance.title, answer.guidance.summary);
    lines.push(plan.title, ...reportingSteps(stage, answer.guidance));
    if (!plan.current) lines.push("The escalation guidance needs updating. Contact your bank through its official channel.");
  } else if (!answer.bankInfo && answer.guidance) {
    lines.push(answer.guidance.title, answer.guidance.summary);
    if (answer.guidance.sourceId !== "payment") {
      lines.push(...answer.guidance.steps.map(s => [s.text, s.why].filter(Boolean).join(" ")));
    }
    if (answer.guidance.followUp) lines.push(answer.guidance.followUp.question);
  } else if (!answer.bankInfo) {
    for (const card of answer.cards) lines.push(card.title, ...card.steps);
  }
  return lines.filter(Boolean).join("\n");
}

export function speechChunks(text: string): string[] {
  const chunks: string[] = [];
  for (const line of text.split(/\n+/)) {
    let rest = line.trim();
    while (rest.length > 220) {
      const boundary = rest.lastIndexOf(" ", 220);
      const cut = boundary > 0 ? boundary : 220;
      chunks.push(rest.slice(0, cut)); rest = rest.slice(cut).trim();
    }
    if (rest) chunks.push(rest);
  }
  return chunks;
}
