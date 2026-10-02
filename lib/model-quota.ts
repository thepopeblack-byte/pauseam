import { json } from "./server.ts";
export const MODEL_USE_LIMIT = 950;
export const MODEL_USE_WINDOW = 30 * 24 * 60 * 60 * 1000;
// Carry the one documented failed engineering reservation from the stopped host.
export const LEGACY_RESERVED_AT = Date.parse("2026-10-02T02:40:40.245Z");
export const RESERVE_SQL = `INSERT INTO pauseam_model_usage (reserved_at)
SELECT ?1 WHERE (SELECT COUNT(*) FROM pauseam_model_usage WHERE reserved_at > ?2) + ?3 < 950`;
export const PRUNE_SQL =
  "DELETE FROM pauseam_model_usage WHERE reserved_at <= ?1";
export type QuotaConfig = { token?: string; db?: D1Database };
async function authenticated(request: Request, token: string) {
  const supplied = request.headers.get("authorization") || "";
  if (supplied.length > 1024) return false;
  const hash = async (value: string) =>
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    );
  const [a, b] = await Promise.all([hash(supplied), hash("Bearer " + token)]);
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a[i] ^ b[i];
  return mismatch === 0;
}
export async function reserveUsage(db: D1Database, now = Date.now()) {
  // Every reservation is an atomic conditional insert on the D1 primary. Batch
  // pruning and insertion together; no read-then-write race or retry on failure.
  const legacy = now < LEGACY_RESERVED_AT + MODEL_USE_WINDOW ? 1 : 0;
  const rows = await db.batch([
    db.prepare(PRUNE_SQL).bind(now - MODEL_USE_WINDOW),
    db.prepare(RESERVE_SQL).bind(now, now - MODEL_USE_WINDOW, legacy),
  ]);
  if (rows.length !== 2 || rows.some((row) => !row.success))
    throw Error("quota unavailable");
  return rows[1].meta.changes === 1;
}
export async function handleQuota(request: Request, config: QuotaConfig) {
  if (!config.token || config.token.length < 32)
    return json(
      { reserved: false, error: "Licence service unavailable." },
      503,
    );
  if (!(await authenticated(request, config.token)))
    return json({ reserved: false, error: "Unauthorized." }, 401);
  if (!config.db)
    return json({ reserved: false, error: "Licence store unavailable." }, 503);
  try {
    const reserved = await reserveUsage(config.db);
    return json({ reserved, limit: MODEL_USE_LIMIT }, reserved ? 200 : 429);
  } catch {
    return json(
      { reserved: false, error: "Licence reservation unavailable." },
      503,
    );
  }
}
