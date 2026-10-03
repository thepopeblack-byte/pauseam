"use client";
import type { Guidance } from "@/lib/guidance";
import type { Card } from "@/lib/safety";

export function ContextualAnswer({ guidance, source, onFollowUp }: {
  guidance: Guidance; source: Card; onFollowUp: (statement: string) => void;
}) {
  return <article className="contextual-answer">
    <h2>{guidance.title}</h2>
    <p className="situation-summary">{guidance.summary}</p>
    {guidance.sourceId !== "payment" && <ol>
      {guidance.steps.map((step, i) => <li key={step.text}>
        <span className="step-number" aria-hidden="true">{i + 1}</span>
        {step.text}{step.why && <small className="step-why">{step.why}</small>}
      </li>)}
    </ol>}
    {guidance.followUp && <fieldset className="follow-up">
      <legend>{guidance.followUp.question}</legend>
      <div className="follow-up-options">{guidance.followUp.choices.map(choice =>
        <button type="button" className="secondary" key={choice.statement} onClick={() => onFollowUp(choice.statement)}>{choice.label}</button>
      )}</div>
      <p className="microcopy">Choose an answer to add it to your question, then send when you are ready.</p>
    </fieldset>}
    {guidance.details.length > 0 && <details className="guidance-detail">
      <summary>More about your situation</summary>
      {guidance.details.map(d => <div key={d.title}><h3>{d.title}</h3><p>{d.text}</p></div>)}
    </details>}
    <details className="guidance-source"><summary>Source and limits</summary>
      <a href={source.source} target="_blank" rel="noreferrer">{source.sourceTitle}</a>
      <p className="microcopy">{source.section} · Checked {source.checked}</p>
      <p className="microcopy">The explanation applies this published guidance to what you described. It does not verify a transaction, identity or account.</p>
    </details>
  </article>;
}
