import Link from "next/link";
import { Pause } from "lucide-react";
import { CARDS, KB_VERSION } from "@/lib/safety";
import {
  LANGUAGES,
  TEXT_MODEL,
  ATTRIBUTION,
  isPilotLanguage,
} from "@/lib/models";
export default function About() {
  return (
    <>
      <header>
        <Link className="brand" href="/">
          <span className="brand-mark">
            <Pause aria-hidden="true" />
          </span>
          <span>
            PauseAm<span className="brand-note">Ask before you pay.</span>
          </span>
        </Link>
        <nav>
          <Link href="/">Back to questions</Link>
        </nav>
      </header>
      <main className="readable-page">
        <h1>A little help before your next step.</h1>
        <p>
          Describe a payment concern in English, by voice or text. PauseAm finds
          a short checklist from reviewed Nigerian sources.
        </p>
        <section className="content-panel">
          <h2>What you can ask</h2>
          <p>
            Ask in your own words about payment requests, sellers, changed bank
            details, school fees, receipts, banking codes, suspected scams or
            bank complaints.
          </p>
          <p>
            This pilot retrieves checklists. It has no working generative text
            model, so it cannot hold a general conversation or answer every
            question. It will say when it has no reviewed guidance.
          </p>
          <p>
            PauseAm cannot verify an account, identify a scammer, authenticate a
            receipt, move money or guarantee recovery.
          </p>
        </section>
        <section className="content-panel">
          <h2>Your information</h2>
          <p>
            No account needed. Leave out names, numbers, PINs, OTPs and
            passwords. Filtering cannot catch every private detail.
          </p>
          <p>
            Voice is optional and needs your consent. Listen before sending,
            then check and correct the transcript. Audio, questions and
            transcripts are processed in memory; this app does not save them.
          </p>
          <details>
            <summary>More about privacy</summary>
            <p>
              Audio passes through the website and team-configured model host.
              Operators must keep request-body and model-output logging off.
              Hosting providers can process network metadata such as IP
              addresses.
            </p>
            <p>
              Incident notes stay in page memory until you leave or clear them.
              Downloads stay wherever your browser saves files. Shared
              checklists exclude your question, transcript and notes.
            </p>
            <p>
              Optional testing saves categories, counts and timings on this
              device, up to 500 records. No text, audio or participant
              identifier is saved. Consent starts off.{" "}
              <Link href="/evaluation">
                View, export or delete your test measurements
              </Link>
              .
            </p>
            <p>
              Read-aloud uses your browser’s voice service and speaks public
              guidance only. Performance measurements appear on the testing
              page, stay in memory and are not sent or saved. Screenshot uploads
              are unavailable.
            </p>
          </details>
        </section>
        <section className="content-panel">
          <h2>Official help & sources</h2>
          <p>
            Suspect fraud? Contact your bank immediately through its official
            app, website or a contact you already trust. Avoid contact details
            supplied only in the suspicious message.
          </p>
          <ul>
            <li>
              <a
                href="https://www.cbn.gov.ng/supervision/cpdfraudandscam.html"
                target="_blank"
                rel="noreferrer"
              >
                CBN: fraud and scam awareness
              </a>
            </li>
            <li>
              <a
                href="https://www.cbn.gov.ng/FinInc/FinLit/LodgeComplaint.html"
                target="_blank"
                rel="noreferrer"
              >
                CBN: lodging and escalating a bank complaint
              </a>
            </li>
            <li>
              <a
                href="https://www.cbn.gov.ng/FinInc/FinLit/BillOfRights.html"
                target="_blank"
                rel="noreferrer"
              >
                CBN: bank customers’ rights and duties
              </a>
            </li>
          </ul>
          <p className="microcopy">
            Sources checked automatically; independent human safety review is
            pending. Checklists are general information, not a verdict.
          </p>
          <details>
            <summary>Checklist review dates</summary>
            <p>
              Library {KB_VERSION}. Missing or expired entries are excluded from
              answers.
            </p>
            {CARDS.map((c) => (
              <details key={c.id}>
                <summary>{c.title}</summary>
                <p>
                  <a href={c.source}>{c.sourceTitle}</a> · {c.section}
                </p>
                {c.basis && <p>{c.basis}</p>}
                <p className="microcopy">
                  {c.review}. Checked {c.checked}; review due {c.expires}.
                </p>
              </details>
            ))}
          </details>
        </section>
        <details className="content-panel">
          <summary>Models, hosting & pilot limitations</summary>
          <p>
            English speech uses the official NCAIR model below. A real recording
            produced a transcript on 2 October 2026; representative accuracy and
            comprehension validation remain pending. Guidance is source
            retrieval, without a generative text model.
          </p>
          {Object.entries(LANGUAGES).map(([code, l]) => (
            <p key={code}>
              <strong>{l.label}</strong> ·{" "}
              {isPilotLanguage(code)
                ? "English pilot; accuracy review pending"
                : "Paused"}
              <br />
              <a href={"https://huggingface.co/" + l.model}>{l.model}</a>
              <br />
              <code>{l.revision}</code>
            </p>
          ))}
          <p>
            Text model{" "}
            <a href={"https://huggingface.co/" + TEXT_MODEL.model}>
              {TEXT_MODEL.model}
            </a>
            , revision <code>{TEXT_MODEL.revision}</code>, is paused because of
            capacity and latency limits. No generic model replaces it.
          </p>
          <p>
            Sites hosts the website; a team-operated SecretVM hosts English ASR.
            This is not evidence of official N-ATLaS API use. Organiser
            confirmation of the official ASR-service requirement is pending. No
            fine-tuning has been performed.{" "}
            <a href="/api/status">Current configuration status</a> is not proof
            of accuracy.
          </p>
          <p>{ATTRIBUTION}</p>
          <p>
            Published model terms limit use to 1,000 active end users in a
            rolling 30-day period. Separate licensing is required before
            exceeding that limit. This pilot preserves a shared conservative
            usage ledger.
          </p>
        </details>
        <Link className="back-link" href="/">
          Back to my question
        </Link>
      </main>
    </>
  );
}
