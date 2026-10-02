// A bounded, isolate-local guard. Production also needs a shared host/WAF limit.
// No IP address, question, audio or transcript is retained here.
const buckets = new Map<string, { start: number; count: number }>();
export function allowRequest(route: string, limit: number, now = Date.now()) {
  const entry = buckets.get(route);
  if (!entry || now - entry.start >= 60000) {
    buckets.set(route, { start: now, count: 1 });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
