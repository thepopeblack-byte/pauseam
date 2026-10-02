"use client";
import { PerformancePanel } from "@/components/performance-panel";
import { downloadBlob } from "@/lib/browser-download";
import { useEffect, useState } from "react";
import { ShieldCheck, Download, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/consent-checkbox";
import { VoiceInput } from "@/components/voice-input";
import { JourneyPanel } from "@/components/journey";
import {
  readTrials,
  clearTrials,
  summary,
  languageSummary,
  type Trial,
} from "@/lib/evaluation";
import {
  MODEL,
  MODEL_URL,
  REVISION,
  TEST_PROMPTS,
  KB_VERSION,
} from "@/lib/safety";
import {
  LANGUAGES,
  ATTRIBUTION,
  isPilotLanguage,
  type Language,
} from "@/lib/models";
export default function Evaluation() {
  const [rows, setRows] = useState<Trial[]>([]),
    [consent, setConsent] = useState(false),
    [prompt, setPrompt] = useState(0),
    [transcript, setTranscript] = useState(""),
    [message, setMessage] = useState("");
  function refresh() {
    setRows(readTrials());
  }
  useEffect(() => {
    const initial = requestAnimationFrame(refresh);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelAnimationFrame(initial);
      window.removeEventListener("focus", onFocus);
    };
  }, []);
  const s = summary(rows);
  function download() {
    const b = new Blob(
      [
        JSON.stringify(
          {
            schema: 2,
            scope:
              "device-local self-reported trials; not independently validated",
            targetModelCatalog: LANGUAGES,
            kbVersion: KB_VERSION,
            summary: s,
            trials: rows,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    try {
      downloadBlob(b, "pauseam-local-evaluation.json");
      setMessage("Check your downloads for the device-local evaluation export.");
    } catch {
      setMessage(
        "Your browser could not download the export. Try another browser on this device; the records remain on this device.",
      );
    }
  }
  return (
    <>
      <header>
        <a className="brand" href="/">
          <ShieldCheck />
          PauseAm
        </a>
        <nav>
          <a href="/">Safety check</a>
          <a href="/about">Model & sources</a>
        </nav>
      </header>
      <main>
        <span className="eyebrow">EVALUATION / THIS DEVICE ONLY</span>
        <h1>Evidence, not estimates.</h1>
        <p>
          Only measurements you consented to save appear here. No seeded
          participants, invented scores or validation claims.
        </p>
        <div className="metric-grid">
          <div className="metric">
            <span>Saved trials</span>
            <strong>{s.total}</strong>Not a count of unique people
          </div>
          <div className="metric">
            <span>ASR successes / attempts</span>
            <strong>
              {s.asrSuccess} / {s.asrAttempts}
            </strong>
            {s.meanAsrMs === null
              ? "Latency not measured"
              : s.meanAsrMs + " ms mean end-to-end attempt latency"}
          </div>
          <div className="metric">
            <span>Prompted word error rate</span>
            <strong>
              {s.wer === null ? "Not measured" : (100 * s.wer).toFixed(1) + "%"}
            </strong>
            {s.werSamples} prompted samples · {s.errors} edits / {s.words}{" "}
            reference words
          </div>
        </div>
        <div className="content-panel">
          <h2>Guidance checks</h2>
          <p>
            Source matches: {s.matched} / {s.answerAttempts} attempts. Helpful
            ratings: {s.helpful} / {s.ratings} ratings.
          </p>
          <p>
            This measures retrieval and self-reported usefulness, not financial
            correctness, scam detection accuracy or money recovered. Word error
            rate can exceed 100% when there are many inserted words.
          </p>
          <div className="chips">
            <button onClick={refresh}>Refresh measurements</button>
            <button disabled={!rows.length} onClick={download}>
              <Download size={14} /> Export anonymous records
            </button>
            <button
              disabled={!rows.length}
              onClick={() => {
                try {
                  clearTrials();
                  setRows([]);
                  setMessage(
                    "All evaluation records on this device were deleted.",
                  );
                } catch {
                  setMessage("Browser storage could not be cleared.");
                }
              }}
            >
              <Trash2 size={14} /> Delete this device’s records
            </button>
          </div>
          {message && <p role="status">{message}</p>}
        </div>
        <div className="content-panel">
          <h2>English pilot measurements</h2>
          <p>
            Grouped by the selected ASR target. This does not verify
            spoken-language correctness or fluent understanding. Older records
            without a language are not assigned one.
          </p>
          {Object.entries(LANGUAGES)
            .filter(([code]) => isPilotLanguage(code))
            .map(([code, identity]) => {
              const m = languageSummary(rows, code as Language);
              return (
                <div className="language-metric" key={code}>
                  <h3>{identity.label}</h3>
                  <p>
                    ASR successes / attempts: {m.successes} / {m.attempts}.
                    Prompted WER:{" "}
                    {m.wer === null
                      ? "Not measured"
                      : (100 * m.wer).toFixed(1) + "%"}{" "}
                    ({m.samples} samples).
                  </p>
                </div>
              );
            })}
          <p>
            No successful model request is claimed by an empty row. Verified
            successful ASR trials retain only the official model ID/revision,
            selected target and anonymous measurements.
          </p>
        </div>
        <div className="content-panel">
          <h2>Run a real voice test</h2>
          <p>
            Read one prompt exactly as written in your usual Nigerian-accented
            English. The actual transcript is compared locally with the prompt.
            Only edit counts, reference word count, outcome and latency are
            saved; audio and text are not.
          </p>
          <label className="consent">
            <Checkbox
              checked={consent}
              onCheckedChange={(v) => {
                setConsent(v === true);
                setTranscript("");
              }}
            />
            I voluntarily agree to this anonymous, device-local test. I can stop
            now or delete records above. I am using a safe sample, not real
            banking details.
          </label>
          <label htmlFor="sample">Test prompt</label>
          <select
            id="sample"
            disabled={consent}
            value={prompt}
            onChange={(e) => setPrompt(Number(e.target.value))}
          >
            {TEST_PROMPTS.map((p, i) => (
              <option key={p} value={i}>
                Prompt {i + 1}
              </option>
            ))}
          </select>
          <blockquote>{TEST_PROMPTS[prompt]}</blockquote>
          {consent && (
            <VoiceInput
              key={prompt}
              testing
              reference={TEST_PROMPTS[prompt]}
              onTranscript={(text) => {
                setTranscript(text);
                setTimeout(refresh, 0);
              }}
            />
          )}
          {transcript && (
            <div className="notice">
              <strong>Actual model transcript (not saved)</strong>
              <p>{transcript}</p>
            </div>
          )}
          <button className="secondary" onClick={refresh}>
            Refresh after test
          </button>
        </div>
        <div className="content-panel">
          <h2>What has not been validated</h2>
          <ul>
            <li>No independent human safety review has been completed.</li>
            <li>
              No accent fairness, noisy-environment or field accuracy claims.
            </li>
            <li>
              No participant count: there are no identifiers or demographic
              records.
            </li>
            <li>
              Device records can be edited in the browser; exports are not
              audited research data.
            </li>
            <li>
              ASR access must be configured and actually tested before a voice
              demo.
            </li>
          </ul>
          <p>
            ASR <a href={MODEL_URL}>{MODEL}</a> · revision {REVISION}.{" "}
            <a href="/api/status">Current backend configuration</a>.
          </p>
        </div>
        <details className="content-panel">
          <summary>Consented question and guidance testing</summary>
          <JourneyPanel journey="before" research />
        </details>
        <PerformancePanel />
        <p className="microcopy">{ATTRIBUTION}</p>
      </main>
    </>
  );
}
