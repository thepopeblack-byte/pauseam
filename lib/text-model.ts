import { TEXT_MODEL, CPU_TEXT_RUNTIME, type Language } from "./models.ts";
import { readLimited } from "./stream.ts";
import {
  currentSourceCards,
  retrieve,
  containsSensitive,
  KB_VERSION,
  type Answer,
  type Journey,
} from "./safety.ts";
type Config = {
  TEXT_ENABLED?: string;
  TEXT_ENDPOINT?: string;
  TEXT_SERVICE_TOKEN?: string;
  KB_ENABLED?: string;
};
export function textEndpoint(config: Config) {
  if (
    config.TEXT_ENABLED !== "true" ||
    !config.TEXT_ENDPOINT ||
    !/^[\x21-\x7e]{32,512}$/.test(config.TEXT_SERVICE_TOKEN || "")
  )
    return null;
  try {
    const u = new URL(config.TEXT_ENDPOINT);
    return u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      !u.search &&
      !u.hash
      ? u
      : null;
  } catch {
    return null;
  }
}
export function validateSelection(data: unknown, allowed: string[]): string[] {
  const d = data as {
    model?: unknown;
    revision?: unknown;
    cardIds?: unknown;
    runtime?: unknown;
    runtimeRevision?: unknown;
    quantization?: unknown;
  };
  if (
    !d ||
    d.model !== TEXT_MODEL.model ||
    d.revision !== TEXT_MODEL.revision ||
    !Array.isArray(d.cardIds) ||
    d.cardIds.length > 1 ||
    d.cardIds.some((id) => typeof id !== "string" || !allowed.includes(id)) ||
    new Set(d.cardIds).size !== d.cardIds.length
  )
    throw new Error("provenance");
  if (
    (d.runtime !== undefined ||
      d.runtimeRevision !== undefined ||
      d.quantization !== undefined) &&
    (d.runtime !== CPU_TEXT_RUNTIME.runtime ||
      d.runtimeRevision !== CPU_TEXT_RUNTIME.revision ||
      d.quantization !== CPU_TEXT_RUNTIME.quantization)
  )
    throw new Error("runtime provenance");
  return d.cardIds as string[];
}
// Model output selects reviewed cards; free prose, contacts and URLs never render.
export async function modelGuidance(
  question: string,
  journey: Journey,
  language: Language,
  config: Config,
  signal?: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<Answer> {
  const base = {
    engine:
      "N-ATLaS relevance check of retrieved card; wording from source library",
    model: TEXT_MODEL.model,
    modelRevision: TEXT_MODEL.revision,
    kbVersion: KB_VERSION,
  };
  if (containsSensitive(question))
    return {
      ...base,
      model: null,
      engine: "Privacy guard; no inference performed",
      status: "sensitive",
      cards: [],
      message: "Remove private details before trying again.",
    };
  const current = currentSourceCards();
  const url = textEndpoint(config);
  if (!url || config.KB_ENABLED === "false" || !current.length)
    throw new Error("unavailable");
  const candidates = retrieve(question, journey, { cards: current });
  if (candidates.status !== "ok") return candidates;
  const cards = candidates.cards;
  const response = await fetcher(url, {
    method: "POST",
    // Reject 3xx below without forwarding the question or service credential.
    redirect: "manual",
    signal: signal
      ? AbortSignal.any([signal, AbortSignal.timeout(45000)])
      : AbortSignal.timeout(45000),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + config.TEXT_SERVICE_TOKEN,
    },
    body: JSON.stringify({
      question,
      journey,
      language,
      cards: cards.map((c) => ({ id: c.id, title: c.title, steps: c.steps })),
    }),
  });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error("inference");
  }
  const data = JSON.parse(
    new TextDecoder().decode(await readLimited(response.body, 4096)),
  );
  const ids = validateSelection(
    data,
    cards.map((c) => c.id),
  );
  return {
    ...base,
    ...(data.runtime
      ? {
          modelRuntime: data.runtime,
          modelRuntimeRevision: data.runtimeRevision,
          modelQuantization: data.quantization,
        }
      : {}),
    status: ids.length ? "ok" : "no_match",
    cards: ids.map((id) => cards.find((c) => c.id === id)!),
    message: ids.length
      ? "Review these actions. This is not a verdict on a person, account or payment."
      : "The model could not find supported guidance. Verify independently with your bank.",
  };
}
