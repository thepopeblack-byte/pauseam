import { speechChunks } from "./spoken-answer.ts";

export type PlaybackState = "idle" | "starting" | "speaking" | "stopped" | "ended" | "unavailable";
export type SpeechPort = {
  cancel(): void;
  speak(text: string, events: { start(): void; end(): void; error(): void }): void;
};

// Generation fencing prevents cancelled/previous utterances advancing a new reply.
export function createSpeechPlayback(port: SpeechPort, update: (state: PlaybackState) => void, startTimeout = 4000) {
  let generation = 0, disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const clear = () => { if (timer) clearTimeout(timer); timer = undefined; };
  const stop = () => {
    generation++; clear(); port.cancel();
    if (!disposed) update("stopped");
  };
  const play = (text: string) => {
    if (disposed) return;
    stop();
    const id = generation, chunks = speechChunks(text);
    let index = 0;
    const fail = () => {
      if (disposed || id !== generation) return;
      generation++; clear(); port.cancel(); update("unavailable");
    };
    const next = () => {
      if (disposed || id !== generation) return;
      if (index === chunks.length) { clear(); update("ended"); return; }
      update("starting");
      timer = setTimeout(fail, startTimeout);
      try {
        port.speak(chunks[index++], {
          start() { if (!disposed && id === generation) { clear(); update("speaking"); } },
          end() { if (!disposed && id === generation) { clear(); next(); } },
          error: fail,
        });
      } catch { fail(); }
    };
    next();
  };
  return { play, stop, dispose() { disposed = true; stop(); } };
}
