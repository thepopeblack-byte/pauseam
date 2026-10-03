"use client";
import { useEffect, useRef, useState } from "react";
import { Play, Square, Volume2 } from "lucide-react";
import { createSpeechPlayback, type PlaybackState } from "@/lib/speech-playback";

export function SpokenReply({ text }: { text: string }) {
  const [state, setState] = useState<PlaybackState>("idle");
  const playback = useRef<ReturnType<typeof createSpeechPlayback> | null>(null);
  const attempted = useRef(false);
  const reply = useRef(text);
  reply.current = text;
  useEffect(() => {
    attempted.current = false;
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setState("unavailable"); return;
    }
    const synthesis = window.speechSynthesis;
    playback.current = createSpeechPlayback({
      cancel: () => synthesis.cancel(),
      speak: (chunk, events) => {
        // Use a local English device voice; do not send reply text to a cloud TTS service.
        const voices = synthesis.getVoices().filter(v => v.localService && /^en(?:-|_)/i.test(v.lang));
        const voice = voices.find(v => /^en[-_]NG$/i.test(v.lang)) || voices.find(v => v.default) || voices[0];
        if (!voice) { events.error(); return; }
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.voice = voice; utterance.lang = voice.lang; utterance.rate = 0.95;
        utterance.onstart = events.start; utterance.onend = events.end; utterance.onerror = events.error;
        synthesis.speak(utterance);
      },
    }, setState);
    const begin = () => {
      if (attempted.current) return;
      if (document.hidden) return;
      if (!synthesis.getVoices().some(v => v.localService && /^en(?:-|_)/i.test(v.lang))) return;
      attempted.current = true; playback.current?.play(reply.current);
    };
    synthesis.addEventListener("voiceschanged", begin);
    begin();
    const voiceTimeout = setTimeout(() => {
      if (!attempted.current) { attempted.current = true; setState("unavailable"); }
    }, 4000);
    const onHidden = () => { if (document.hidden) { attempted.current = true; playback.current?.stop(); } };
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      clearTimeout(voiceTimeout);
      synthesis.removeEventListener("voiceschanged", begin);
      document.removeEventListener("visibilitychange", onHidden);
      playback.current?.dispose(); playback.current = null;
    };
  }, []);
  const previous = useRef(text);
  useEffect(() => {
    if (previous.current !== text) {
      attempted.current = true; playback.current?.stop(); previous.current = text;
    }
  }, [text]);
  const playing = state === "starting" || state === "speaking";
  return <div className="spoken-reply" aria-label="Spoken reply">
    <div className="spoken-reply-heading"><span className="spoken-reply-icon"><Volume2 size={22} aria-hidden="true" /></span>
      <div><strong>Your voice reply</strong><p role="status">{state === "speaking" ? "Speaking…" : state === "starting" ? "Starting voice…" : state === "ended" ? "Finished · replay any time" : state === "stopped" ? "Stopped" : state === "unavailable" ? "Voice couldn’t start here. Read below or try replay." : "Preparing voice…"}</p></div>
    </div>
    <div className="spoken-reply-controls">
      <button type="button" className="secondary" disabled={!text || playing} onClick={() => { attempted.current = true; if (playback.current) playback.current.play(text); else setState("unavailable"); }}><Play size={17} aria-hidden="true" /> Replay reply</button>
      <button type="button" className="secondary" disabled={!playing && state !== "idle"} onClick={() => { attempted.current = true; playback.current?.stop(); }}><Square size={16} aria-hidden="true" /> Stop</button>
    </div>
    <details className="speech-details"><summary>About this voice</summary><p>Your device reads the answer aloud. N-ATLaS handles speech recognition and model-based guidance; bank contacts come directly from official sources. This readout is not an N-ATLaS speech-generation model. A local English voice must be available on your device.</p></details>
  </div>;
}
