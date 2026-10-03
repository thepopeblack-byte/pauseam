"use client";
import type { BankInformation as Information } from "@/lib/bank-directory";
export function BankInformation({ information }: { information: Information }) {
  return (
    <article className="bank-information">
      <h2>{information.bank}</h2>
      <dl className="bank-facts">
        {information.facts.map(f => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd>{f.label === "Customer-care email" ? <a href={"mailto:" + f.value}>{f.value}</a> : f.label === "Customer-care phone" ? <a href={"tel:" + f.value.replace(/[^+\d]/g, "")}>{f.value}</a> : <strong>{f.value}</strong>}</dd>
            <p className="microcopy"><a href={f.source.url} target="_blank" rel="noreferrer">Official bank source</a></p>
            <details><summary>Source details</summary><p>{f.source.title}</p><p>Checked {f.source.checked} · Review due {f.source.expires}</p><p className="microcopy">{f.source.review}</p></details>
          </div>
        ))}
      </dl>
      <p>Use the official bank page to confirm these details. Never share a PIN, OTP or password with a caller or in an email.</p>
      {information.facts.some(f => f.label === "USSD menu") && <p>This is the bank’s published menu code. PauseAm does not run USSD or handle a payment.</p>}
    </article>
  );
}
