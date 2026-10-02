"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Mic, Square, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/consent-checkbox";
import { recordingCallbacks } from "@/lib/recording";
import { toWav } from "@/lib/audio";
import { wordErrors } from "@/lib/safety";
import { LANGUAGES, type Language } from "@/lib/models";
import { saveTrial, type Trial } from "@/lib/evaluation";
export function VoiceInput({
  onTranscript,
  testing = false,
  reference = "",
  journey = "before",
  language = "en",
  disabled = false,
  onActivityChange,
}: {
  onTranscript: (text: string, model: string) => void;
  testing?: boolean;
  reference?: string;
  journey?: "before" | "after" | "learn";
  language?: Language;
  disabled?: boolean;
  onActivityChange?: (active: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState(false),
    [configured, setConfigured] = useState<boolean | null>(null),
    [recording, setRecording] = useState(false),
    [busy, setBusy] = useState(false),
    [audio, setAudio] = useState<Blob | null>(null),
    [message, setMessage] = useState("");
  useEffect(() => {
    onActivityChange?.(busy || recording);
  }, [busy, recording, onActivityChange]);
  const identity = LANGUAGES[language];
  const operation = useRef(0);
  const testingRef = useRef(testing);
  useLayoutEffect(() => {
    testingRef.current = testing;
  }, [testing]);
  const recorder = useRef<MediaRecorder | null>(null),
    stream = useRef<MediaStream | null>(null),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    alive = useRef(true),
    cancel = useRef<AbortController | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const invalidate = useCallback(() => {
    operation.current++;
    cancel.current?.abort();
  }, []);
  useEffect(() => {
    alive.current = true;
    let active = true;
    fetch("/api/status", { signal: AbortSignal.timeout(8000) })
      .then((r) => r.json())
      .then((d) => {
        if (active && alive.current)
          setConfigured(
            (
              d as {
                languages?: Partial<Record<Language, { configured?: boolean }>>;
              }
            ).languages?.[language]?.configured === true,
          );
      })
      .catch(() => {
        if (active && alive.current) setConfigured(false);
      });
    return () => {
      active = false;
      alive.current = false;
      invalidate();
      if (timer.current) clearTimeout(timer.current);
      if (recorder.current?.state === "recording") recorder.current.stop();
      stream.current?.getTracks().forEach((t) => t.stop());
    };
  }, [language, invalidate]);
  useEffect(() => {
    const element = audioElement.current;
    if (!audio || !element) return;
    const value = URL.createObjectURL(audio);
    element.src = value;
    return () => {
      element.removeAttribute("src");
      URL.revokeObjectURL(value);
    };
  }, [audio]);
  function stop() {
    if (recorder.current?.state === "recording") recorder.current.stop();
    stream.current?.getTracks().forEach((t) => t.stop());
    if (timer.current) clearTimeout(timer.current);
    setRecording(false);
  }
  async function record() {
    setMessage("");
    setAudio(null);
    if (!consent) return;
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setMessage(
        "Recording is not supported here. Use a current browser over HTTPS, or type your question.",
      );
      return;
    }
    setBusy(true);
    const id = ++operation.current;
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!alive.current || operation.current !== id) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = media;
      const rec = new MediaRecorder(media);
      recorder.current = rec;
      Object.assign(
        rec,
        recordingCallbacks(
          () => alive.current && operation.current === id,
          rec.mimeType,
          setAudio,
          () => {
            operation.current++;
            stop();
            setMessage("Recording failed. Please type instead.");
          },
        ),
      );
      rec.start();
      setRecording(true);
      timer.current = setTimeout(stop, 28000);
    } catch {
      stream.current?.getTracks().forEach((t) => t.stop());
      if (alive.current && operation.current === id)
        setMessage(
          "Microphone access was not available. You can type instead.",
        );
    } finally {
      if (alive.current && operation.current === id) setBusy(false);
    }
  }
  async function send() {
    if (!audio || !consent || busy) return;
    setBusy(true);
    setMessage("");
    const started = performance.now(),
      id = ++operation.current,
      saveMeasurement = testingRef.current;
    cancel.current = new AbortController();
    const controller = cancel.current;
    const trial: Trial = {
      kind: "asr",
      journey,
      language,
      outcome: "failed",
      latencyMs: 0,
    };
    try {
      const bytes = await toWav(audio);
      if (
        !alive.current ||
        operation.current !== id ||
        controller.signal.aborted
      ) {
        bytes.fill(0);
        return;
      }
      const timeout = setTimeout(() => controller.abort(), 50000);
      let response: Response;
      try {
        response = await fetch("/api/asr", {
          method: "POST",
          headers: {
            "Content-Type": "audio/wav",
            "X-Audio-Consent": "yes",
            "X-Language": language,
          },
          body: bytes as BodyInit,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
        bytes.fill(0);
      }
      const data = (await response.json()) as {
        error?: string;
        text: string;
        model: string;
        revision: string;
        language: Language;
      };
      if (!response.ok)
        throw new Error(data.error || "Speech recognition is unavailable.");
      if (
        data.language !== language ||
        data.model !== identity.model ||
        data.revision !== identity.revision ||
        typeof data.text !== "string"
      )
        throw new Error("The model identity could not be verified.");
      trial.outcome = "ok";
      trial.model = data.model;
      trial.modelRevision = data.revision;
      if (reference) Object.assign(trial, wordErrors(reference, data.text));
      if (
        alive.current &&
        operation.current === id &&
        !controller.signal.aborted
      ) {
        onTranscript(data.text, data.model);
        setOpen(false);
      }
    } catch (e) {
      if (alive.current && operation.current === id)
        setMessage(
          e instanceof Error
            ? e.message
            : "No transcript was available. Type instead.",
        );
    } finally {
      trial.latencyMs = Math.min(
        120000,
        Math.round(performance.now() - started),
      );
      if (
        saveMeasurement &&
        testingRef.current &&
        alive.current &&
        operation.current === id &&
        !saveTrial(trial)
      )
        setMessage("Test result could not be saved on this device.");
      if (alive.current && operation.current === id) {
        setBusy(false);
        setAudio(null);
      }
    }
  }
  return (
    <div className="voice-input">
      <button
        type="button"
        className="voice-toggle"
        aria-expanded={open}
        aria-controls={"voice-" + journey}
        disabled={disabled || busy || recording}
        onClick={() => {
          setOpen(!open);
          setAudio(null);
          setMessage("");
        }}
      >
        <Mic size={18} aria-hidden="true" />
        {open ? "Close voice" : "Speak instead"}
      </button>
      {open && (
        <div className="voice-panel" id={"voice-" + journey}>
          <label className="consent">
            <Checkbox
              checked={consent}
              disabled={disabled || busy || recording}
              onCheckedChange={(v) => {
                setConsent(v === true);
                setAudio(null);
              }}
            />
            I agree to send audio to N-ATLaS for transcription. This app
            processes it in memory without saving it. I won't speak private
            details.
          </label>
          <button
            type="button"
            className="voice-button"
            disabled={disabled || !consent || busy || configured !== true}
            onClick={recording ? stop : record}
          >
            {recording ? (
              <Square aria-hidden="true" />
            ) : (
              <Mic aria-hidden="true" />
            )}
            <span>
              {recording
                ? "Stop recording"
                : busy
                  ? "Transcribing..."
                  : "Start recording"}
              <small>
                {configured === null
                  ? "Checking voice availability..."
                  : configured
                    ? "English  /  up to 28 seconds"
                    : "Voice unavailable. Please type instead."}
              </small>
            </span>
          </button>
          {recording && (
            <p role="status" className="microcopy">
              Recording. Press stop when you've finished.
            </p>
          )}
          {audio && (
            <div className="voice-preview">
              <p className="microcopy">
                Listen first. Discard the recording if it includes private
                details.
              </p>
              <audio controls ref={audioElement} />
              <div className="chips">
                <button type="button" disabled={busy} onClick={send}>
                  Transcribe this recording
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setAudio(null)}
                >
                  <Trash2 size={14} aria-hidden="true" />
                  Discard
                </button>
              </div>
            </div>
          )}
          {busy && (
            <>
              <p role="status" className="microcopy">
                Please wait. You'll review the transcript before getting
                guidance.
              </p>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  operation.current++;
                  cancel.current?.abort();
                  stop();
                  setBusy(false);
                  setAudio(null);
                  setMessage("Cancelled. No transcript will be used.");
                }}
              >
                Cancel voice request
              </button>
            </>
          )}
          {message && (
            <p role="alert" className="notice">
              {message}
            </p>
          )}
          <details className="provenance">
            <summary>Voice & privacy details</summary>
            <p>
              Transcription:{" "}
              <a
                href={"https://huggingface.co/" + identity.model}
                target="_blank"
                rel="noreferrer"
              >
                {identity.model}
              </a>{" "}
              / {identity.revision.slice(0, 8)}. Recognition accuracy is still
              being reviewed. Check and correct your transcript.{" "}
              <a href="/about">More about your data</a>.
            </p>
          </details>
        </div>
      )}
    </div>
  );
}
