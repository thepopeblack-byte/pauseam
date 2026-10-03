import { settings, json, sameOrigin, boundedBody } from "@/lib/server";
import { retrieve } from "@/lib/safety";
import { isLanguage, isPilotLanguage } from "@/lib/models";
import { modelGuidance, textEndpoint } from "@/lib/text-model";
import { allowRequest } from "@/lib/rate-limit";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return json({ error: "Request origin rejected." }, 403);
  if (!allowRequest("answer", 90))
    return json({ error: "Too many requests. Try again in a minute." }, 429);
  try {
    const data = JSON.parse(
      new TextDecoder().decode(await boundedBody(request, 4096)),
    );
    const language = data.language || "en";
    if (
      typeof data.question !== "string" ||
      data.question.length > 600 ||
      !data.question.trim() ||
      !["before", "after", "learn"].includes(data.journey) ||
      !isLanguage(language)
    )
      return json(
        {
          error:
            "Choose a journey and enter a short situation without private details.",
        },
        400,
      );
    if (!isPilotLanguage(language))
      return json(
        {
          status: "unavailable",
          cards: [],
          model: null,
          engine: "English-only pilot",
          message:
            "This pilot accepts English questions only. Choose English to continue.",
        },
        503,
      );
    const s = await settings();
    let answer = retrieve(data.question, data.journey, {
      disabled: s.KB_ENABLED === "false",
    });
    // Privacy/source checks precede inference. Urgent actions do not await a model.
    if (
      answer.status !== "unavailable" &&
      answer.status !== "sensitive" &&
      !answer.bankQuery &&
      data.journey !== "after" &&
      answer.cards[0]?.id !== "report"
    ) {
      if (s.TEXT_ENABLED === "true") {
        try {
          if (!textEndpoint(s))
            throw new Error("Model configuration unavailable");
          answer = await modelGuidance(
            data.question,
            data.journey,
            language,
            s,
            request.signal,
          );
        } catch {
          answer = {
            ...answer,
            status: "unavailable",
            cards: [],
            message:
              "N-ATLaS did not return verified guidance. Pause and verify independently. General information is available in the source directory.",
          };
        }
      }
    }
    return json(
      { ...answer, traceId: crypto.randomUUID() },
      answer.status === "unavailable"
        ? 503
        : answer.status === "sensitive"
          ? 422
          : 200,
    );
  } catch {
    return json(
      { error: "Cannot read this request. No guidance was generated." },
      400,
    );
  }
}
