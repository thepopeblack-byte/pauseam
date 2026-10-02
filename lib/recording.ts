/** Ignore late recorder events after cancellation, replacement or unmount. */
export function recordingCallbacks(
  isCurrent: () => boolean,
  mimeType: string,
  onAudio: (audio: Blob) => void,
  onError: () => void,
) {
  const chunks: Blob[] = [];
  let failed = false;
  return {
    ondataavailable: (event: { data: Blob }) => {
      if (!failed && isCurrent() && event.data.size) chunks.push(event.data);
    },
    onerror: () => {
      failed = true;
      chunks.length = 0;
      if (isCurrent()) onError();
    },
    onstop: () => {
      if (!failed && isCurrent() && chunks.length)
        onAudio(new Blob(chunks, { type: mimeType }));
      chunks.length = 0;
    },
  };
}
