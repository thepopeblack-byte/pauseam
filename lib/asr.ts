import { containsSensitive } from "./safety.ts";
import { readLimited } from "./stream.ts";
import { LANGUAGES, type Language } from "./models.ts";
export type ASRConfig = {
  ASR_ENDPOINT?: string;
  ASR_SERVICE_TOKEN?: string;
  ASR_ENABLED?: string;
  ASR_YO_ENDPOINT?: string;
  ASR_HA_ENDPOINT?: string;
  ASR_IG_ENDPOINT?: string;
};
export function configuredEndpoint(
  config: ASRConfig,
  language: Language = "en",
) {
  const endpoint =
    language === "en"
      ? config.ASR_ENDPOINT
      : config[`ASR_${language.toUpperCase()}_ENDPOINT` as keyof ASRConfig];
  if (
    config.ASR_ENABLED !== "true" ||
    !endpoint ||
    !/^[\x21-\x7e]{32,512}$/.test(config.ASR_SERVICE_TOKEN || "")
  )
    return null;
  try {
    const url = new URL(endpoint);
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
      ? url
      : null;
  } catch {
    return null;
  }
}
export const MAX_AUDIO = 960044;
export function asrFailure(error: unknown) {
  const code = error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name)
    ? "timeout" : error instanceof Error ? error.message : "inference";
  const failures: Record<string, { status: number; error: string }> = {
    sensitive: { status: 422, error: "Private details were detected and the transcript was discarded. Describe the situation without account details or secret codes." },
    audio: { status: 422, error: "That recording could not be read. Record clearly for up to 28 seconds, or type your question." },
    no_speech: { status: 422, error: "No clear speech was recognised. Try again closer to the microphone, or type your question." },
    busy: { status: 429, error: "Voice is busy with another recording. Wait a moment and try again." },
    quota: { status: 429, error: "The pilot voice limit has been reached. Please contact the PauseAm team." },
    timeout: { status: 504, error: "Transcription took too long. Try a shorter recording, or type your question." },
    large: { status: 413, error: "That recording is too large. Record for up to 28 seconds." },
  };
  return Object.hasOwn(failures, code) ? failures[code] : { status: 503, error: "Speech recognition is temporarily unavailable. Please try again or type your question." };
}
export function validWav(bytes: Uint8Array) {
  if (bytes.length < 44 || bytes.length > MAX_AUDIO) return false;
  const d = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength),
    txt = (n: number, l: number) =>
      new TextDecoder().decode(bytes.slice(n, n + l));
  return (
    txt(0, 4) === "RIFF" &&
    txt(8, 4) === "WAVE" &&
    txt(12, 4) === "fmt " &&
    d.getUint32(16, true) === 16 &&
    d.getUint16(20, true) === 1 &&
    d.getUint16(22, true) === 1 &&
    d.getUint32(24, true) === 16000 &&
    d.getUint32(28, true) === 32000 &&
    d.getUint16(32, true) === 2 &&
    d.getUint16(34, true) === 16 &&
    txt(36, 4) === "data" &&
    d.getUint32(40, true) === bytes.length - 44 &&
    d.getUint32(4, true) === bytes.length - 8 &&
    (bytes.length - 44) % 2 === 0 &&
    bytes.length >= 16044
  );
}
export async function transcribe(
  bytes: Uint8Array,
  config: ASRConfig,
  fetcher: typeof fetch = fetch,
  signal?: AbortSignal,
  language: Language = "en",
) {
  const url = configuredEndpoint(config, language);
  if (!url) throw new Error("unavailable");
  const identity = LANGUAGES[language];
  if (!validWav(bytes)) throw new Error("audio");
  const timeout = AbortSignal.timeout(45000);
  const response = await fetcher(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + config.ASR_SERVICE_TOKEN,
      "Content-Type": "audio/wav",
    },
    body: bytes as BodyInit,
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    // Workers rejects redirect="error". Never follow a redirect with audio/secrets.
    redirect: "manual",
  });
  if (!response.ok) {
    // Only classify the host's known error codes. Never display raw upstream
    // bodies, model text, proxy HTML or credential-containing error details.
    if (response.status === 422 || response.status === 429) {
      let detail: unknown;
      try {
        detail = JSON.parse(new TextDecoder().decode(await readLimited(response.body, 4096))).detail;
      } catch { /* Unknown bounded error body still fails closed. */ }
      if (response.status === 422)
        throw new Error(detail === "Possible private details: transcript discarded" ? "sensitive" : detail === "No usable transcript" ? "no_speech" : "audio");
      throw new Error(detail === "Pilot licence quota reached; contact the team" ? "quota" : "busy");
    }
    await response.body?.cancel();
    if (response.status === 408 || response.status === 504) throw new Error("timeout");
    if (response.status === 413 || response.status === 415) throw new Error("audio");
    throw new Error("inference");
  }
  const raw = new TextDecoder().decode(await readLimited(response.body, 8192));
  const data = JSON.parse(raw);
  if (
    data.language !== language ||
    data.model !== identity.model ||
    data.revision !== identity.revision ||
    typeof data.text !== "string" ||
    !data.text.trim() ||
    data.text.length > 1000 ||
    (data.redacted !== undefined && typeof data.redacted !== "boolean")
  )
    throw new Error("provenance");
  // The active ASR policy promises redacted numeric output. Keep this stronger
  // check even though corrected/typed questions now accept amounts and dates.
  if (containsSensitive(data.text) || /\p{Nd}/u.test(data.text)) throw new Error("sensitive");
  return {
    text: data.text.trim(),
    model: identity.model,
    revision: identity.revision,
    language,
    confidence: null,
    ...(data.redacted === true ? { redacted: true } : {}),
  };
}
