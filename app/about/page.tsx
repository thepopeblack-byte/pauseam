import Link from "next/link";
import { CARDS, KB_VERSION } from "@/lib/safety";
import { LANGUAGES, TEXT_MODEL, ATTRIBUTION } from "@/lib/models";
export default function About() {
  return (
    <>
      <header>
        <Link className="brand" href="/">
          PauseAm
        </Link>
        <nav>
          <Link href="/">Back to guidance</Link>
          <Link href="/evaluation">Evaluation</Link>
        </nav>
      </header>
      <main>
        <span className="eyebrow">SOURCES, MODELS & PRIVACY</span>
        <h1>Know what you’re using.</h1>
        <section className="content-panel">
          <h2>What this build can establish</h2>
          <p>
            PauseAm provides general payment checklists. It does not
            authenticate a person, account, invoice or receipt, move money or
            promise recovery. Source checking by Codex is complete for the
            listed pages; independent human safety review is pending.
          </p>
          <p>
            English source checklists work without a model. The model adapters
            are implemented, but live N-ATLaS inference, four-language
            comprehension and fluent language review have not yet been
            validated.{" "}
            <a href="/api/status">Read current configuration status</a>.
            Configured does not mean tested.
          </p>
        </section>
        <section className="content-panel">
          <h2>Official sources and reporting routes</h2>
          <p>
            If you suspect fraud, contact your bank immediately through its
            official app, website or an independently trusted channel. PauseAm
            does not maintain bank phone numbers. Do not use a contact supplied
            only in the suspicious message.
          </p>
          <p>
            <a
              href="https://www.cbn.gov.ng/FinInc/FinLit/LodgeComplaint.html"
              target="_blank"
              rel="noreferrer"
            >
              CBN: how to lodge and escalate a complaint
            </a>
            . Complain to the institution first and retain evidence. Check the
            current process and applicable timelines at the source; do not delay
            an urgent fraud report. Review: 1 October 2026.
          </p>
          <p>
            Library {KB_VERSION}. Entries expire 1 November 2026. Missing or
            expired sources stop personalised retrieval. Scenario adaptations
            are labelled separately from the source facts.
          </p>
          {CARDS.map((c) => (
            <details key={c.id}>
              <summary>{c.title}</summary>
              <p>
                <a href={c.source} target="_blank" rel="noreferrer">
                  {c.sourceTitle}
                </a>{" "}
                — {c.section}
              </p>
              {c.basis && <p>{c.basis}</p>}
              <p className="microcopy">
                {c.review}. Checked {c.checked}; review due {c.expires}.
              </p>
            </details>
          ))}
        </section>
        <section className="content-panel">
          <h2>Model identity and hosting</h2>
          <p>
            Official model targets are listed below. None is replaced by a
            browser or generic model. An authenticated HTTPS inference service
            must return the expected pinned identity; failure produces no usable
            transcript.
          </p>
          {Object.values(LANGUAGES).map((l) => (
            <p key={l.model}>
              <strong>{l.label}</strong>:{" "}
              <a href={"https://huggingface.co/" + l.model}>{l.model}</a>
              <br />
              <code>{l.revision}</code> · live validation pending.
            </p>
          ))}
          <p>
            Text model:{" "}
            <a href={"https://huggingface.co/" + TEXT_MODEL.model}>
              {TEXT_MODEL.model}
            </a>
            <br />
            <code>{TEXT_MODEL.revision}</code>. When configured, it selects from
            source-checked cards. Free-form model prose and invented links never
            become advice. Current checklist wording remains English.
          </p>
          <p>
            The web app runs on Sites / Cloudflare Workers. Model services are
            separate, team-configured hosts. This is not proof of official
            N-ATLaS API use. Organiser confirmation of the official ASR-service
            requirement is pending. No fine-tuning has been performed.
          </p>
          <p>{ATTRIBUTION}</p>
          <p>
            The published model terms cap use at 1,000 active end users within a
            rolling 30-day period. Separate licensing is needed before exceeding
            this. Public inference must remain off until the operator has
            verified access, capacity and licence accounting.
          </p>
        </section>
        <section className="content-panel">
          <h2>Your choices and data</h2>
          <p>
            No account is required. Never enter names, PINs, OTPs, passwords,
            account numbers or full credentials. Filtering cannot identify every
            private detail. Screenshot uploads are disabled pending reliable
            redaction and privacy review.
          </p>
          <p>
            Recording requires separate consent. Listen and discard any private
            content before upload. Submitted audio is processed in memory
            through the app and configured model host; this code does not save
            raw audio, questions or transcripts. Hosting operators must also
            disable request-body and model-output logging.
          </p>
          <p>
            The incident timeline contains only selected event types and times.
            It stays in page memory until you leave or clear it. A downloaded
            summary is stored wherever your browser saves downloads. Shared
            checklists include only general public guidance and source links.
          </p>
          <p>
            Optional evaluation records store categories, counts and timings in
            this browser, up to 500 records. No participant identifier, audio or
            text is saved. Consent starts off; export and deletion are your
            choice. This is not independent research validation.
            Page-performance metrics stay in memory and are not transmitted.
          </p>
          <p>
            Hosting providers can process operational metadata such as IP
            addresses. Browser read-aloud may use a device or browser-provider
            service; it receives public guidance only. No claim of anonymity is
            made for ordinary network transport.
          </p>
        </section>
      </main>
    </>
  );
}
