"use client";
import { useEffect, useState, useRef, useSyncExternalStore } from "react";
import { Volume2, LockKeyhole, CheckCheck } from "lucide-react";
import { Checkbox } from "@/components/consent-checkbox";
import { Incident } from "@/components/incident";
import { ShareChecklist } from "@/components/share-checklist";
import { ReportGuide } from "@/components/report-guide";
import { LearningUpdates } from "@/components/learning-updates";
import { PILOT_LANGUAGE } from "@/lib/models";
import { VoiceInput } from "@/components/voice-input";
import { containsSensitive, type Journey, type Answer } from "@/lib/safety";
import { saveTrial, type Trial } from "@/lib/evaluation";
const subscribeReady = () => () => {};
const topics = {
  before: [
    "Someone sent a link asking for my banking code.",
    "A supplier changed the bank details on an invoice.",
    "I received school fee instructions in a message.",
    "A buyer sent a receipt as proof of payment.",
  ],
  after: [
    "I already paid and suspect a scam.",
    "My bank complaint remains unresolved.",
  ],
  learn: [
    "How do I protect my banking codes?",
    "How can I recognise an investment scam?",
    "How do I check an online seller?",
  ],
};
export function JourneyPanel({
  journey,
  research = false,
}: {
  journey: Journey;
  research?: boolean;
}) {
  const ready = useSyncExternalStore(
    subscribeReady,
    () => true,
    () => false,
  );
  const language = PILOT_LANGUAGE;
  const [voiceActive, setVoiceActive] = useState(false);
  const pending = useRef<AbortController | null>(null),
    active = useRef(true),
    quizStarted = useRef(0);
  const [question, setQuestion] = useState(""),
    [answer, setAnswer] = useState<Answer | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [asrModel, setAsrModel] = useState(""),
    [confirmed, setConfirmed] = useState(false),
    [testing, setTesting] = useState(false),
    [trial, setTrial] = useState<Trial | null>(null),
    [saved, setSaved] = useState(false),
    [quiz, setQuiz] = useState<boolean | null>(null);
  const resultRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (answer) resultRef.current?.focus();
  }, [answer]);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      pending.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (tool: unknown, options: unknown) => void;
        };
      }
    ).modelContext;
    if (!context) return;
    const controller = new AbortController();
    try {
      context.registerTool(
        {
          name: "stage_safety_question",
          description:
            "Stage a non-sensitive safety question in the visible form for the user to review. Does not submit or record data.",
          inputSchema: {
            type: "object",
            properties: { question: { type: "string", maxLength: 600 } },
            required: ["question"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: true },
          execute: async (input: unknown) => {
            const q = (input as { question?: unknown })?.question;
            if (
              typeof q !== "string" ||
              !q.trim() ||
              q.length > 600 ||
              containsSensitive(q)
            )
              throw new Error("Use a short situation without private details.");
            setQuestion(q);
            setAnswer(null);
            setAsrModel("");
            setConfirmed(false);
            setQuiz(null);
            setTrial(null);
            setSaved(false);
            setError("");
            pending.current?.abort();
            setBusy(false);
            await new Promise((r) =>
              requestAnimationFrame(() => requestAnimationFrame(r)),
            );
            return { staged: true, submitted: false };
          },
        },
        { signal: controller.signal },
      );
    } catch {}
    return () => controller.abort();
  }, []);
  function edit(value: string) {
    pending.current?.abort();
    setBusy(false);
    setQuiz(null);
    setError("");
    setQuestion(value);
    setAnswer(null);
    setTrial(null);
    setSaved(false);
    setConfirmed(false);
  }
  async function ask() {
    setError("");
    setAnswer(null);
    setTrial(null);
    setSaved(false);
    setQuiz(null);
    if (!question.trim()) {
      setError("Tell us what happened, or try one of the examples.");
      return;
    }
    if (containsSensitive(question)) {
      setQuestion("");
      setAsrModel("");
      setError(
        "Private details or numbers were detected and cleared. Please describe only the situation.",
      );
      return;
    }
    if (asrModel && !confirmed) {
      setError("Please check and confirm the transcript first.");
      return;
    }
    setBusy(true);
    const start = performance.now();
    const controller = new AbortController();
    pending.current?.abort();
    pending.current = controller;
    try {
      const response = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, journey, language }),
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(50000),
        ]),
      });
      const data = (await response.json()) as Answer;
      if (
        !["ok", "unavailable", "no_match", "sensitive"].includes(data.status) ||
        !Array.isArray(data.cards)
      )
        throw new Error(
          "Guidance is unavailable. Pause and contact your bank through a trusted channel.",
        );
      if (!active.current || controller.signal.aborted) return;
      setAnswer(data);
      quizStarted.current = performance.now();
      const t: Trial = {
        kind: "answer",
        journey,
        language,
        outcome:
          data.status === "ok"
            ? "ok"
            : data.status === "no_match"
              ? "no_match"
              : "failed",
        latencyMs: Math.round(performance.now() - start),
        ...(data.traceId ? { traceId: data.traceId } : {}),
        ...(data.status === "ok" && data.model && data.modelRevision
          ? { model: data.model, modelRevision: data.modelRevision }
          : {}),
      };
      setTrial(t);
      if (testing && data.status !== "ok") {
        if (saveTrial(t)) setSaved(true);
        else setError("The local test result could not be saved.");
      }
    } catch {
      if (!active.current || controller.signal.aborted) return;
      setError(
        "Guidance is unavailable. Pause and contact your bank through a trusted channel.",
      );
      if (testing)
        saveTrial({
          kind: "answer",
          journey,
          language,
          outcome: "failed",
          latencyMs: Math.min(120000, Math.round(performance.now() - start)),
        });
    } finally {
      if (active.current && pending.current === controller) setBusy(false);
    }
  }
  function rate(helpful?: boolean) {
    if (!testing || !trial || saved) return;
    const ok = saveTrial({
      ...trial,
      ...(helpful === undefined ? {} : { helpful }),
    });
    setSaved(ok);
    if (!ok) setError("The local test result could not be saved.");
  }
  function listen() {
    if (!answer) return;
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(
      answer.cards.flatMap((c) => [c.title, ...c.steps]).join(". "),
    );
    speech.lang = "en-NG";
    speech.rate = 0.9;
    window.speechSynthesis.speak(speech);
  }
  return (
    <div className="card-body">
      <h1>
        {journey === "after"
          ? "Let’s report the problem."
          : journey === "learn"
            ? "Spot the warning signs."
            : "What’s happening?"}
      </h1>
      <p className="question-intro">
        {journey === "after"
          ? "Describe what happened. We’ll help you prepare a report and find the right next step."
          : journey === "learn"
            ? "Ask about a payment warning sign, or try an example below."
            : "Ask about a payment, message or money concern. Use your own words."}
      </p>
      {journey === "after" && (!answer || answer.status !== "ok") && (
        <section className="urgent-help" aria-label="First actions">
          <h2>Contact your bank now</h2>
          <ol>
            <li>
              Use your bank’s official app, website or a contact you already
              trust. Ask it to secure the account and investigate.
            </li>
            <li>
              Keep your payment confirmation and messages privately. Ask the
              bank for a complaint reference.
            </li>
          </ol>
          <p className="microcopy">Recovery is not guaranteed.</p>
        </section>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask();
        }}
      >
        <label
          className={asrModel ? "" : "visually-hidden"}
          htmlFor={"question-" + journey}
        >
          {asrModel
            ? "Check and correct what we heard"
            : "Your payment question"}
        </label>
        <div className="composer">
          <textarea
            id={"question-" + journey}
            value={question}
            maxLength={600}
            autoComplete="off"
            disabled={!ready || busy || voiceActive}
            onChange={(e) => edit(e.target.value)}
            placeholder={
              journey === "after"
                ? "What happened after you paid?"
                : "For example: I sent money, but the seller has stopped replying. What should I do?"
            }
            aria-describedby="question-privacy"
          />
          <div className="composer-actions">
            <VoiceInput
              language={language}
              journey={journey}
              testing={testing}
              disabled={busy}
              onActivityChange={setVoiceActive}
              onTranscript={(text, model) => {
                edit(text);
                setAsrModel(model);
                requestAnimationFrame(() =>
                  document.getElementById("question-" + journey)?.focus(),
                );
              }}
            />
            <button
              type="submit"
              className="primary"
              disabled={
                !ready || busy || voiceActive || (!!asrModel && !confirmed)
              }
            >
              {!ready ? "Loading…" : busy ? "Checking…" : "Get next steps"}
            </button>
          </div>
        </div>
        <p className="privacy-note" id="question-privacy">
          <LockKeyhole size={15} aria-hidden="true" />
          Leave out names, numbers, PINs, OTPs and passwords.
        </p>
        {asrModel && (
          <div className="transcript-review">
            <label className="consent">
              <Checkbox
                checked={confirmed}
                onCheckedChange={(v) => setConfirmed(v === true)}
              />
              I’ve checked this transcript and removed private details.
            </label>
          </div>
        )}
      </form>
      {!answer && !busy && (
        <>
          <p className="example-label">Or start with one of these</p>
          <div className="chips examples" aria-label="Example questions">
            {topics[journey].map((t, i) => (
              <button
                type="button"
                disabled={!ready}
                key={t}
                onClick={() => {
                  edit(t);
                  setAsrModel("");
                  document.getElementById("question-" + journey)?.focus();
                }}
              >
                {
                  (journey === "after"
                    ? ["Suspected scam", "Bank not responding"]
                    : journey === "learn"
                      ? ["Banking codes", "Investment offers", "Online sellers"]
                      : [
                          "Someone asks for a code",
                          "New supplier bank details",
                          "School fee message",
                          "A buyer sent a receipt",
                        ])[i]
                }
              </button>
            ))}
          </div>
        </>
      )}
      {error && (
        <div role="alert" className="notice">
          {error}
        </div>
      )}
      {(busy || answer) && (
        <div aria-busy={busy}>
          {busy && (
            <div className="result response-loading" role="status">
              <h2>Finding your next step</h2>
              <p>One moment…</p>
              <div className="loading-line" aria-hidden="true" />
              <div className="loading-line" aria-hidden="true" />
            </div>
          )}
          {answer && (
            <section
              className="result"
              tabIndex={-1}
              ref={resultRef}
              aria-label="Your next steps"
              aria-live="polite"
            >
              {answer.cards.length > 0 ? (
                <div className="result-heading">
                  <CheckCheck size={19} aria-hidden="true" />
                  Your next steps
                </div>
              ) : (
                <h2>
                  {answer.status === "no_match"
                    ? "Tell us a little more"
                    : "We couldn’t check this"}
                </h2>
              )}
              {journey === "after" && answer.status === "ok" ? (
                <ReportGuide question={question} />
              ) : (
                answer.cards.map((c) => (
                  <article key={c.id}>
                    <h2>{c.title}</h2>
                    <ol>
                      {c.steps.map((step, i) => (
                        <li key={step}>
                          <span className="step-number" aria-hidden="true">
                            {i + 1}
                          </span>
                          {step}
                          {c.why?.[i] && (
                            <small className="step-why">{c.why[i]}</small>
                          )}
                        </li>
                      ))}
                    </ol>
                  </article>
                ))
              )}
              {answer.cards.length === 0 && <p>{answer.message}</p>}
              {answer.cards.length > 0 && journey !== "after" && (
                <div className="result-tools">
                  <ShareChecklist answer={answer} />
                  <button
                    type="button"
                    className="secondary"
                    onClick={listen}
                    disabled={!ready || !("speechSynthesis" in window)}
                  >
                    <Volume2 size={16} aria-hidden="true" />
                    Listen
                  </button>
                </div>
              )}
              {answer.status === "no_match" && (
                <div className="chips">
                  <button
                    type="button"
                    onClick={() => {
                      edit("My bank complaint remains unresolved.");
                      setAsrModel("");
                    }}
                  >
                    Help with a bank complaint
                  </button>
                </div>
              )}
              {journey === "before" && answer.cards[0]?.id === "report" && (
                <details>
                  <summary>Prepare a bank or CBN report</summary>
                  <ReportGuide question={question} />
                </details>
              )}
              {testing && trial && !saved && answer.status === "ok" && (
                <div className="content-panel">
                  <p>Was this useful?</p>
                  <div className="chips">
                    <button type="button" onClick={() => rate(true)}>
                      Yes
                    </button>
                    <button type="button" onClick={() => rate(false)}>
                      No
                    </button>
                    <button type="button" onClick={() => rate()}>
                      Save without rating
                    </button>
                  </div>
                </div>
              )}
              {saved && (
                <p role="status" className="microcopy">
                  Test measurement saved on this device. No question or
                  transcript saved.
                </p>
              )}
              {journey === "learn" && answer.cards.length > 0 && (
                <details>
                  <summary>Try a quick practice</summary>
                  <p>
                    A caller says your account will be blocked unless you share
                    a code. What would you do?
                  </p>
                  <div className="quiz-options">
                    {[true, false].map((safer) => (
                      <button
                        type="button"
                        className="secondary"
                        key={String(safer)}
                        disabled={quiz !== null}
                        onClick={() => {
                          setQuiz(safer);
                          if (testing)
                            saveTrial({
                              kind: "quiz",
                              journey,
                              language,
                              outcome: safer ? "ok" : "failed",
                              latencyMs: Math.min(
                                120000,
                                Math.round(
                                  performance.now() - quizStarted.current,
                                ),
                              ),
                            });
                        }}
                      >
                        {safer
                          ? "End the call and contact my bank independently"
                          : "Share the code to avoid the block"}
                      </button>
                    ))}
                  </div>
                  {quiz !== null && (
                    <p role="status">
                      Keep the code private and contact your bank independently.
                    </p>
                  )}
                </details>
              )}
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  edit("");
                  setAsrModel("");
                  document.getElementById("question-" + journey)?.focus();
                }}
              >
                Ask another question
              </button>
            </section>
          )}
        </div>
      )}
      {journey === "after" && (
        <details>
          <summary>Prepare notes for your bank</summary>
          <Incident />
        </details>
      )}
      {journey === "learn" && <LearningUpdates />}
      {research && (
        <details className="research-options">
          <summary>Optional: help us test PauseAm</summary>
          <label className="consent">
            <Checkbox
              checked={testing}
              disabled={busy}
              onCheckedChange={(v) => {
                setTesting(v === true);
                setTrial(null);
                setSaved(false);
              }}
            />
            Save anonymous timing and feedback on this device. No question,
            transcript or audio is saved. Turning this off stops new
            measurements.
          </label>
          <a href="/evaluation">View or delete test measurements</a>
        </details>
      )}
    </div>
  );
}
