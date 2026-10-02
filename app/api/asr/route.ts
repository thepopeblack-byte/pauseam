import { settings, json, sameOrigin, boundedBody } from "@/lib/server";
import { transcribe, MAX_AUDIO, asrFailure } from "@/lib/asr";
import { isLanguage, isPilotLanguage } from "@/lib/models";
import { allowRequest } from "@/lib/rate-limit";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return json({ error: "Request origin rejected." }, 403);
  if (request.headers.get("x-audio-consent") !== "yes")
    return json({ error: "Audio-processing consent is required." }, 400);
  if (request.headers.get("content-type") !== "audio/wav")
    return json({ error: "Use mono 16 kHz WAV audio." }, 415);
  const language = request.headers.get("x-language") || "en";
  if (!isLanguage(language))
    return json({ error: "Choose a supported language." }, 400);
  if (!isPilotLanguage(language))
    return json({ error: "This pilot accepts English recordings only." }, 503);
  if (!allowRequest("asr", 30))
    return json(
      { error: "Voice is busy. Wait a minute or type instead." },
      429,
    );
  try {
    const bytes = await boundedBody(request, MAX_AUDIO);
    try {
      const start = performance.now();
      const result = await transcribe(
        bytes,
        await settings(),
        fetch,
        request.signal,
        language,
      );
      return json({
        ...result,
        traceId: crypto.randomUUID(),
        latencyMs: Math.round(performance.now() - start),
      });
    } finally {
      bytes.fill(0);
    }
  } catch (error) {
    const failure = asrFailure(error);
    return json({ error: failure.error }, failure.status);
  }
}
