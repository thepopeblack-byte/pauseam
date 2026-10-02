"use client";
import { useState } from "react";
import {
  complaintPlan,
  COMPLAINT_SOURCE,
  reportDraft,
  type ComplaintStage,
} from "@/lib/reporting";

export function ReportGuide({ question }: { question: string }) {
  const [stage, setStage] = useState<ComplaintStage>("first");
  const [message, setMessage] = useState("");
  const plan = complaintPlan(stage);
  const draft = reportDraft(question, stage);
  function download() {
    if (!draft) {
      setMessage(
        "Describe the situation without numbers or private details first.",
      );
      return;
    }
    const url = URL.createObjectURL(
      new Blob([draft], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "pauseam-report-draft.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(
      "Draft downloaded. Review it and add transaction details only through the verified reporting channel. Nothing has been sent.",
    );
  }
  return (
    <section className="report-guide" aria-label="Reporting steps">
      <h2>Where should I report it?</h2>
      <label htmlFor="complaint-stage">What has your bank done so far?</label>
      <select
        id="complaint-stage"
        value={stage}
        onChange={(e) => {
          setStage(e.target.value as ComplaintStage);
          setMessage("");
        }}
      >
        <option value="first">I have not contacted my bank</option>
        <option value="waiting">I reported it and am waiting</option>
        <option value="unacknowledged">
          No acknowledgment or reference after three days
        </option>
        <option value="overdue">
          The applicable resolution time has passed
        </option>
      </select>
      <h3>{plan.title}</h3>
      <ol>
        {plan.steps.map((step, index) => (
          <li key={step}>
            <span className="step-number" aria-hidden="true">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
      {plan.current && stage !== "first" && (
        <p className="microcopy">
          CBN guidance allows escalation if acknowledgment or a tracking number
          is missing after three days, or the applicable resolution time has
          passed. Resolution times depend on the complaint; check the guide for
          your case. Report suspected fraud immediately.
        </p>
      )}
      {!plan.current && (
        <p role="status">
          The escalation guidance needs updating. Contact your bank through its
          official channel.
        </p>
      )}
      <div className="chips">
        {draft && (
          <button type="button" className="secondary" onClick={download}>
            Download my report draft
          </button>
        )}
        {plan.current && (
          <a
            className="text-button"
            href={COMPLAINT_SOURCE.url}
            target="_blank"
            rel="noreferrer"
          >
            CBN reporting instructions
          </a>
        )}
      </div>
      {draft && (
        <details>
          <summary>Review my report draft</summary>
          <p className="report-draft">{draft}</p>
        </details>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
