import { readLimited } from "./stream.ts";

// Keep the deadline active through the response body, not just HTTP headers.
export async function requestJson(
  url: string,
  init: RequestInit,
  timeoutMs = 50_000,
  maxBytes = 32_768,
  fetcher: typeof fetch = fetch,
): Promise<{ response: Response; data: unknown }> {
  const deadline = AbortSignal.timeout(timeoutMs);
  const signal = init.signal ? AbortSignal.any([init.signal, deadline]) : deadline;
  const response = await fetcher(url, { ...init, signal });
  const bytes = await readLimited(response.body, maxBytes);
  return { response, data: JSON.parse(new TextDecoder().decode(bytes)) };
}
