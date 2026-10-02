import { LANGUAGES, TEXT_MODEL, isLanguage, type Language } from "./models.ts";
export const EVAL_KEY = "pauseam-evaluation-v1";
const LEGACY_KEY = "before-you-pay-evaluation-v1";
export type Trial = {
  kind: "answer" | "asr" | "quiz";
  journey: "before" | "after" | "learn";
  outcome: "ok" | "failed" | "no_match";
  latencyMs: number;
  helpful?: boolean;
  errors?: number;
  words?: number;
  language?: Language;
  model?: string;
  modelRevision?: string;
  traceId?: string;
  recordedAt?: string;
};
export function cleanTrial(input: unknown): Trial | null {
  if (!input || typeof input !== "object") return null;
  const t = input as Trial;
  if (
    !["answer", "asr", "quiz"].includes(t.kind) ||
    !["before", "after", "learn"].includes(t.journey) ||
    !["ok", "failed", "no_match"].includes(t.outcome) ||
    !Number.isFinite(t.latencyMs) ||
    t.latencyMs < 0 ||
    t.latencyMs > 120000
  )
    return null;
  const r: Trial = {
    kind: t.kind,
    journey: t.journey,
    outcome: t.outcome,
    latencyMs: Math.round(t.latencyMs),
  };
  if (t.language !== undefined) {
    if (!isLanguage(t.language)) return null;
    r.language = t.language;
  }
  if (t.model !== undefined || t.modelRevision !== undefined) {
    if (
      t.outcome !== "ok" ||
      !r.language ||
      !["asr", "answer"].includes(t.kind) ||
      t.model !==
        (t.kind === "asr" ? LANGUAGES[r.language].model : TEXT_MODEL.model) ||
      t.modelRevision !==
        (t.kind === "asr"
          ? LANGUAGES[r.language].revision
          : TEXT_MODEL.revision)
    )
      return null;
    r.model = t.model;
    r.modelRevision = t.modelRevision;
  }
  if (t.traceId !== undefined) {
    if (
      typeof t.traceId !== "string" ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(
        t.traceId,
      )
    )
      return null;
    r.traceId = t.traceId;
  }
  if (t.recordedAt !== undefined) {
    if (
      typeof t.recordedAt !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(t.recordedAt) ||
      !Number.isFinite(Date.parse(t.recordedAt))
    )
      return null;
    r.recordedAt = t.recordedAt;
  }
  if (typeof t.helpful === "boolean") r.helpful = t.helpful;
  if (
    t.kind === "asr" &&
    t.outcome === "ok" &&
    Number.isInteger(t.errors) &&
    Number.isInteger(t.words) &&
    t.errors! >= 0 &&
    t.errors! <= 500 &&
    t.words! > 0 &&
    t.words! <= 100
  ) {
    r.errors = t.errors;
    r.words = t.words;
  }
  return r;
}
export function readTrials(): Trial[] {
  try {
    const data = JSON.parse(
      localStorage.getItem(EVAL_KEY) ||
        localStorage.getItem(LEGACY_KEY) ||
        "[]",
    );
    return Array.isArray(data)
      ? data
          .map(cleanTrial)
          .filter((x): x is Trial => !!x)
          .slice(-500)
      : [];
  } catch {
    return [];
  }
}
export function saveTrial(trial: Trial) {
  const t = cleanTrial({ ...trial, recordedAt: new Date().toISOString() });
  if (!t) return false;
  try {
    localStorage.setItem(
      EVAL_KEY,
      JSON.stringify([...readTrials(), t].slice(-500)),
    );
    return true;
  } catch {
    return false;
  }
}
export function clearTrials() {
  localStorage.removeItem(EVAL_KEY);
  localStorage.removeItem(LEGACY_KEY);
}
export function summary(rows: Trial[]) {
  const asr = rows.filter((x) => x.kind === "asr"),
    measured = asr.filter(
      (x) => x.errors !== undefined && x.words !== undefined,
    ),
    errors = measured.reduce((s, x) => s + x.errors!, 0),
    words = measured.reduce((s, x) => s + x.words!, 0);
  const answers = rows.filter((x) => x.kind === "answer"),
    ratings = answers.filter((x) => x.helpful !== undefined);
  return {
    total: rows.length,
    asrAttempts: asr.length,
    asrSuccess: asr.filter((x) => x.outcome === "ok").length,
    wer: words ? errors / words : null,
    werSamples: measured.length,
    errors,
    words,
    answerAttempts: answers.length,
    matched: answers.filter((x) => x.outcome === "ok").length,
    ratings: ratings.length,
    helpful: ratings.filter((x) => x.helpful).length,
    meanAsrMs: asr.length
      ? Math.round(asr.reduce((s, x) => s + x.latencyMs, 0) / asr.length)
      : null,
  };
}

export function languageSummary(rows: Trial[], language: Language) {
  const selected = rows.filter((r) => r.language === language),
    asr = selected.filter((r) => r.kind === "asr");
  const measured = asr.filter(
    (r) => r.errors !== undefined && r.words !== undefined,
  );
  const errors = measured.reduce((n, r) => n + r.errors!, 0),
    words = measured.reduce((n, r) => n + r.words!, 0);
  return {
    trials: selected.length,
    attempts: asr.length,
    successes: asr.filter((r) => r.outcome === "ok").length,
    wer: words ? errors / words : null,
    samples: measured.length,
  };
}
