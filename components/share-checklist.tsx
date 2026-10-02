"use client";
import { useState } from "react";
import type { Answer } from "@/lib/safety";
export function ShareChecklist({ answer }: { answer: Answer }) {
  const [status, setStatus] = useState("");
  async function share() {
    const text = [
      "PauseAm — Ask before you pay.",
      "General checklist only; not a verdict on a person or payment.",
      ...answer.cards.flatMap((c) => [
        c.title,
        ...c.steps,
        c.source,
        "Source checked " + c.checked,
      ]),
    ].join("\n");
    try {
      if (navigator.share)
        await navigator.share({ title: "PauseAm checklist", text });
      else {
        await navigator.clipboard.writeText(text);
        setStatus("Checklist copied. Review it before sharing.");
      }
    } catch {
      setStatus("Nothing was shared. You can select and copy the checklist.");
    }
  }
  return (
    <div>
      <button className="secondary" onClick={share}>
        Share checklist
      </button>
      <p className="microcopy">
        Only these general steps and sources are shared. Your question,
        transcript and incident notes are excluded.
      </p>
      {status && <p role="status">{status}</p>}
    </div>
  );
}
