"use client";
import { useState } from "react";
import { downloadBlob } from "@/lib/browser-download";
import { hasContactedBank } from "@/lib/payment-context";
import type { Guidance } from "@/lib/guidance";
import {
  complaintPlan,
  reportingSteps,
  COMPLAINT_SOURCE,
  reportDraft,
  type ComplaintStage,
} from "@/lib/reporting";

export function ReportGuide({ question, context, stage: suppliedStage, onStageChange }: { question: string; context?: Guidance; stage?: ComplaintStage; onStageChange?: (stage: ComplaintStage) => void }) {
  const [localStage, setStage] = useState<ComplaintStage>(() => hasContactedBank(question) ? "waiting" : "first");
  const stage = suppliedStage ?? localStage;
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
        "Describe what happened. Amounts and dates are welcome; leave out account details and secret codes.",
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
      <h2>{context?.title || "Where should I report it?"}</h2>
      {context && <p className="situation-summary">{context.summary}</p>}
      <label htmlFor="complaint-stage">What has your bank done so far?</label>
      <select
        id="complaint-stage"
        value={stage}
        onChange={(e) => {
          setStage(e.target.value as ComplaintStage);
          onStageChange?.(e.target.value as ComplaintStage);
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
        {reportingSteps(stage, context).map((step, index) => (
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
      {context && context.details.length > 0 && <details className="guidance-detail"><summary>More about your situation</summary>{context.details.map(d => <div key={d.title}><h3>{d.title}</h3><p>{d.text}</p></div>)}</details>}
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
