"use client";
import { useState } from "react";
const events = [
  "Payment requested",
  "Payment made",
  "Concern noticed",
  "Bank contacted",
  "Complaint acknowledged",
  "Follow-up made",
];
const evidence = [
  "Keep the original payment confirmation privately",
  "Keep the request and conversation privately",
  "Note when you contacted the bank",
  "Ask the bank for a complaint reference",
];
export function Incident() {
  const [rows, setRows] = useState<{ event: string; at: string }[]>([]),
    [event, setEvent] = useState(events[0]),
    [at, setAt] = useState(""),
    [checks, setChecks] = useState<string[]>([]),
    [error, setError] = useState("");
  function add() {
    if (
      !at ||
      !Number.isFinite(Date.parse(at)) ||
      Date.parse(at) > Date.now()
    ) {
      setError("Choose when this happened, no later than now.");
      return;
    }
    setRows((r) => [...r, { event, at }].slice(-20));
    setAt("");
    setError("");
  }
  function download() {
    const text = [
      "PauseAm — private incident preparation",
      "This is your timeline, not an investigation or evidence of fraud.",
      "No recovery is guaranteed. Provide transaction details only through your bank’s verified channel.",
      "",
      ...rows.map((r) => r.at.replace("T", " ") + " — " + r.event),
      "",
      ...evidence.map((e) => (checks.includes(e) ? "Done: " : "To do: ") + e),
      "",
      "Official complaint guide: https://www.cbn.gov.ng/FinInc/FinLit/LodgeComplaint.html",
      "Source checked: 2026-10-01; independent human review pending.",
    ].join("\n");
    const u = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = u;
    a.download = "pauseam-incident-summary.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  }
  return (
    <section className="content-panel">
      <h3>Prepare for your bank conversation</h3>
      <p>
        Keep originals privately. This page records only event types and times,
        in memory until you leave. Do not enter account details or secrets.
      </p>
      <fieldset>
        <legend>Evidence checklist</legend>
        {evidence.map((e) => (
          <label className="check-row" key={e}>
            <input
              type="checkbox"
              checked={checks.includes(e)}
              onChange={(v) =>
                setChecks((c) =>
                  v.target.checked ? [...c, e] : c.filter((x) => x !== e),
                )
              }
            />
            {e}
          </label>
        ))}
      </fieldset>
      <details>
        <summary>Add a private incident timeline</summary>
        <label htmlFor="event-type">What happened?</label>
        <select
          id="event-type"
          value={event}
          onChange={(e) => setEvent(e.target.value)}
        >
          {events.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>
        <label htmlFor="event-time">When? (your device’s local time)</label>
        <input
          id="event-time"
          type="datetime-local"
          value={at}
          onInput={(e) => setAt(e.currentTarget.value)}
        />
        <button
          className="secondary"
          onClick={add}
          disabled={rows.length >= 20}
        >
          Add event
        </button>
        {error && <p role="alert">{error}</p>}
        <ol>
          {rows.map((r, i) => (
            <li key={i}>
              {r.at.replace("T", " ")} — {r.event}{" "}
              <button
                className="text-button"
                onClick={() => setRows((x) => x.filter((_, j) => i !== j))}
                aria-label={"Remove " + r.event}
              >
                Remove
              </button>
            </li>
          ))}
        </ol>
      </details>
      <div className="chips">
        <button onClick={download}>Download my summary</button>
        <button
          onClick={() => {
            setRows([]);
            setChecks([]);
            setAt("");
          }}
        >
          Clear this page’s notes
        </button>
      </div>
      <p className="microcopy">
        The download contains only the selections above. Your browser may retain
        downloaded files.{" "}
        <a
          href="https://www.cbn.gov.ng/FinInc/FinLit/LodgeComplaint.html"
          target="_blank"
          rel="noreferrer"
        >
          CBN complaint process
        </a>{" "}
        · checked 1 October 2026.
      </p>
    </section>
  );
}
