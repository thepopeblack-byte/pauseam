import Link from "next/link";
import { Pause } from "lucide-react";
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
        <h1>A little help with your next step.</h1>
        <section className="content-panel">
          <h2>Ask in your own words</h2>
          <p>
            Describe a payment concern in English, by voice or text. Get a short
            checklist to help you decide what to do next.
          </p>
          <p>
            Ask about sellers, payment requests, changed bank details, school
            fees, receipts, banking codes or bank complaints. If we cannot help
            with a question, we will say so.
          </p>
          <p>
            PauseAm cannot verify an account or receipt, identify a scammer,
            move money or guarantee recovery.
          </p>
        </section>
        <section className="content-panel">
          <h2>Your privacy</h2>
          <p>
            No account needed. Leave out names, account numbers, PINs, OTPs and
            passwords.
          </p>
          <p>
            Voice is optional. Agree before recording, listen before sending,
            then check and correct what we heard. This app processes recordings,
            questions and transcripts without saving them.
          </p>
          <details>
            <summary>More about your information</summary>
            <p>
              Audio is sent through this website to our transcription host.
              Hosting providers may process network information such as IP
              addresses. Private information filtering cannot catch everything.
            </p>
            <p>
              Bank preparation notes stay on this page until you leave or clear
              them. Downloads stay where your browser saves them. Sharing a
              checklist excludes your question, transcript and notes.
            </p>
            <p>
              Listening reads only the guidance using your browser&apos;s voice
              service. No research measurements are saved during ordinary use.
            </p>
          </details>
        </section>
        <details className="content-panel">
          <summary>Official payment help</summary>
          <p>
            Suspect fraud? Contact your bank immediately through its official
            app, website or a contact you already trust.
          </p>
          <ul>
            <li>
              <a
                href="https://www.cbn.gov.ng/supervision/cpdfraudandscam.html"
                target="_blank"
                rel="noreferrer"
              >
                Fraud and scam guidance
              </a>
            </li>
            <li>
              <a
                href="https://www.cbn.gov.ng/FinInc/FinLit/LodgeComplaint.html"
                target="_blank"
                rel="noreferrer"
              >
                Help with a bank complaint
              </a>
            </li>
            <li>
              <a
                href="https://www.cbn.gov.ng/FinInc/FinLit/BillOfRights.html"
                target="_blank"
                rel="noreferrer"
              >
                Your rights as a bank customer
              </a>
            </li>
          </ul>
        </details>
        <Link className="back-link" href="/">
          Back to my question
        </Link>
      </main>
    </>
  );
}
