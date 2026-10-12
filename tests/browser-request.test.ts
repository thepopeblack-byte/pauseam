import test from "node:test";
import assert from "node:assert/strict";
import { requestJson } from "../lib/browser-request.ts";

test("JSON requests keep their timeout through a stalled response body", async () => {
  let cancelled = false;
  const fetcher = (async (_url: unknown, init: RequestInit) => new Response(new ReadableStream({
    start(controller) {
      init.signal!.addEventListener("abort", () => {
        cancelled = true;
        controller.error(init.signal!.reason);
      }, { once: true });
    },
  }))) as typeof fetch;
  // Native AbortSignal.timeout does not keep Node alive by itself.
  const keepAlive = setTimeout(() => {}, 1000);
  try {
    await assert.rejects(requestJson("/api/asr", {}, 20, 100, fetcher), { name: "TimeoutError" });
    assert.equal(cancelled, true);
  } finally { clearTimeout(keepAlive); }
});

test("caller cancellation still cancels a JSON response after headers arrive", async () => {
  const caller = new AbortController();
  const fetcher = (async (_url: unknown, init: RequestInit) => {
    return new Response(new ReadableStream({ start(controller) {
      init.signal!.addEventListener("abort", () => controller.error(init.signal!.reason), { once: true });
      queueMicrotask(() => caller.abort());
    } }));
  }) as typeof fetch;
  await assert.rejects(requestJson("/api/asr", { signal: caller.signal }, 1000, 100, fetcher), { name: "AbortError" });
});

test("JSON requests reject oversized and malformed response bodies", async () => {
  const fetcher = (async () => Response.json({ text: "x".repeat(200) })) as typeof fetch;
  await assert.rejects(requestJson("/api/asr", {}, 1000, 100, fetcher), /large/);
  await assert.rejects(requestJson("/api/asr", {}, 1000, 100, (async () => new Response("proxy HTML")) as typeof fetch), SyntaxError);
  const valid = await requestJson("/api/asr", {}, 1000, 100, (async () => Response.json({ text: "Actual returned text" })) as typeof fetch);
  assert.deepEqual(valid.data, { text: "Actual returned text" });
});
