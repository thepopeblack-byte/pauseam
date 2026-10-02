"use client";
import { useState } from "react";
import { downloadBlob } from "@/lib/browser-download";
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
  async function copy() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft);
      setMessage(
        "Report copied. Review it before sending through the verified reporting channel. Nothing has been sent.",
      );
    } catch {
      setMessage(
        "Copy did not work here. Open the report preview below, then select and copy the text.",
      );
    }
  }
  function download() {
    if (!draft) {
      setMessage(
        "Describe the situation without numbers or private details first.",
      );
      return;
    }
    try {
      downloadBlob(
        new Blob([draft], { type: "text/plain;charset=utf-8" }),
        "pauseam-report-draft.txt",
      );
      setMessage(
        "Check your downloads for the draft. If it did not save, open the report preview below and copy it. Nothing has been sent.",
      );
    } catch {
      setMessage(
        "Download did not work here. Open the report preview below, then select and copy the text. Nothing has been sent.",
      );
    }
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
          <button
            type="button"
            className="secondary"
            onClick={() => void copy()}
          >
            Copy my report
          </button>
        )}
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
