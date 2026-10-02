import { containsSensitive } from "./safety.ts";

export type ComplaintStage = "first" | "waiting" | "unacknowledged" | "overdue";
export const COMPLAINT_SOURCE = {
  url: "https://www.cbn.gov.ng/Out/2022/CCD/CBN%20How%20to%20Lodge%20a%20Complaint.pdf",
  checked: "2026-10-02",
  expires: "2026-11-01",
  review: "Official source checked; independent human review pending",
  email: "cpd@cbn.gov.ng",
};
export function complaintPlan(stage: ComplaintStage, now = new Date()) {
  const current =
    now.getTime() >= Date.parse(COMPLAINT_SOURCE.checked + "T00:00:00Z") &&
    now.getTime() <= Date.parse(COMPLAINT_SOURCE.expires + "T23:59:59Z");
  const escalate =
    current && (stage === "unacknowledged" || stage === "overdue");
  return {
    escalate,
    current,
    title: escalate
      ? "Prepare a CBN complaint about your bank"
      : "Start with your bank",
    steps: escalate
      ? [
          "Keep proof that you complained to your bank, including its reply or your attempt to get a reference.",
          "Explain what happened, how the bank responded and what you want it to investigate.",
          "Use the CBN complaint guide to check the route, then send your complaint yourself to cpd@cbn.gov.ng.",
        ]
      : stage === "waiting"
        ? [
            "Keep the bank's complaint reference and ask for its expected resolution date.",
            "Follow up through the bank's official channel. If fraud is ongoing, contact it urgently again.",
            "If acknowledgment or resolution is overdue, return here to check the CBN escalation route.",
          ]
        : [
            "Open your bank's official app or website, or visit a branch. Use its complaints channel; never a contact supplied only in the suspicious message.",
            "Describe the payment issue and ask it to investigate. If fraud is suspected, ask it to secure the affected account now.",
            "Ask for a complaint reference and the expected resolution date. Keep the payment evidence privately.",
          ],
  };
}

export function reportDraft(
  question: string,
  stage: ComplaintStage,
  now = new Date(),
): string | null {
  const description = question.trim();
  if (
    !description ||
    description.length > 600 ||
    containsSensitive(description)
  )
    return null;
  const plan = complaintPlan(stage, now);
  return [
    plan.escalate
      ? "Subject: Complaint about my bank's handling of a payment issue"
      : "Subject: Request to investigate a payment issue",
    "",
    "My description (please review for accuracy):",
    description,
    "",
    plan.escalate
      ? "I previously raised this issue with my bank. Please review its handling of my complaint."
      : "Please investigate this payment issue and provide a complaint reference and an expected resolution date. If my account is at risk, please help secure it urgently.",
    "",
    "Before sending, add the transaction date, amount, reference, bank name and relevant evidence ONLY through the recipient's verified channel. For CBN escalation, include proof of the complaint to the bank and its response or lack of acknowledgment.",
    "Never include PINs, OTPs or passwords. Review every sentence; this draft is not an investigation, fraud finding or guarantee of recovery. PauseAm has not sent this report.",
    "Complaint guidance: " + COMPLAINT_SOURCE.url,
  ].join("\n");
}
