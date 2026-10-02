"use client";
import { useEffect, useState } from "react";
import type { SafetyUpdate } from "@/lib/updates";
type Update = Pick<
  SafetyUpdate,
  | "id"
  | "title"
  | "published"
  | "summary"
  | "steps"
  | "source"
  | "challenge"
  | "choices"
  | "explanation"
>;
function isUpdate(value: unknown): value is Update {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  const fields = [
    "id",
    "title",
    "published",
    "summary",
    "source",
    "challenge",
    "explanation",
  ];
  if (
    !fields.every(
      (key) =>
        typeof item[key] === "string" &&
        (item[key] as string).length > 0 &&
        (item[key] as string).length <= 700,
    )
  )
    return false;
  if (
    !Array.isArray(item.steps) ||
    !item.steps.length ||
    item.steps.length > 3 ||
    !item.steps.every((step) => typeof step === "string" && step.length <= 700)
  )
    return false;
  if (
    !Array.isArray(item.choices) ||
    item.choices.length !== 2 ||
    !item.choices.every(
      (choice) => typeof choice === "string" && choice.length <= 200,
    )
  )
    return false;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(item.published as string) ||
    !Number.isFinite(Date.parse(item.published as string))
  )
    return false;
  try {
    const source = new URL(item.source as string);
    return (
      source.protocol === "https:" &&
      !source.username &&
      !source.password &&
      ["cert.gov.ng", "www.cbn.gov.ng"].includes(source.hostname)
    );
  } catch {
    return false;
  }
}
export function LearningUpdates() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [status, setStatus] = useState("Loading updates...");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/learn", {
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        const entries =
          data && typeof data === "object" && "updates" in data
            ? data.updates
            : null;
        if (
          !Array.isArray(entries) ||
          !entries.length ||
          !entries.every(isUpdate)
        ) {
          setStatus(
            "No current updates are available. You can still ask a question above.",
          );
          return;
        }
        setUpdates(entries);
        setStatus("");
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setStatus(
            "Updates could not load. Try again when you are connected.",
          );
      });
    return () => controller.abort();
  }, [retry]);
  return (
    <section
      className="learning-updates"
      aria-label="Scam and security updates"
    >
      <h2>Scam &amp; security updates</h2>
      <p className="microcopy">
        Practical lessons from dated official notices.
      </p>
      {status && <p role="status">{status}</p>}
      {!updates.length && status !== "Loading updates..." && (
        <button
          type="button"
          className="text-button"
          onClick={() => {
            setStatus("Loading updates...");
            setRetry((n) => n + 1);
          }}
        >
          Try again
        </button>
      )}
      {updates.map((update) => (
        <details className="lesson" key={update.id}>
          <summary>
            {update.title}
            <small>
              {new Date(update.published + "T12:00:00Z").toLocaleDateString(
                "en-NG",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  timeZone: "Africa/Lagos",
                },
              )}
            </small>
          </summary>
          <p>{update.summary}</p>
          <h3>Protect yourself</h3>
          <ol>
            {update.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p>
            <strong>{update.challenge}</strong>
          </p>
          <div className="quiz-options">
            {update.choices.map((choice, index) => (
              <button
                type="button"
                className="secondary"
                key={choice}
                aria-pressed={answers[update.id] === index}
                onClick={() =>
                  setAnswers((a) => ({ ...a, [update.id]: index }))
                }
              >
                {choice}
              </button>
            ))}
          </div>
          {answers[update.id] !== undefined && (
            <p role="status">
              {answers[update.id] === 0
                ? "That is the safer next step. "
                : "Pause and try the independent route. "}
              {update.explanation}
            </p>
          )}
          <a
            className="text-button"
            href={update.source}
            target="_blank"
            rel="noreferrer"
          >
            ngCERT advisories
          </a>
        </details>
      ))}
    </section>
  );
}
