import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import {
  handleQuota,
  reserveUsage,
  LEGACY_RESERVED_AT,
  MODEL_USE_WINDOW,
} from "../lib/model-quota.ts";
import { licensedModelFetch, migrationCeiling } from "../lib/model-licence-fetch.ts";

function ledger() {
  const sql = new DatabaseSync(":memory:");
  sql.exec(
    "CREATE TABLE pauseam_model_usage (id INTEGER PRIMARY KEY AUTOINCREMENT,reserved_at INTEGER NOT NULL)",
  );
  const db = {
    prepare: (query: string) => ({
      bind: (...values: number[]) => ({ query, values }),
    }),
    batch: async (statements: { query: string; values: number[] }[]) => {
      sql.exec("BEGIN IMMEDIATE");
      try {
        const rows = statements.map((s) => ({
          success: true,
          meta: {
            changes: Number(sql.prepare(s.query).run(...s.values).changes),
          },
        }));
        sql.exec("COMMIT");
        return rows;
      } catch (e) {
        sql.exec("ROLLBACK");
        throw e;
      }
    },
  } as unknown as D1Database;
  return { sql, db };
}

test("migration allowance caps concurrent outbound calls without creating prior-user records", async () => {
  const { sql, db } = ledger();
  const now = Date.parse("2026-10-11T21:00:00Z");
  const config = { DB: db, MODEL_LEGACY_USER_UPPER_BOUND: "200", MODEL_LEGACY_HOLD_UNTIL: "2026-11-10T21:00:00Z" };
  assert.equal(migrationCeiling(config, now), 800);
  for (let i = 0; i < 797; i++) assert.equal(await reserveUsage(db, now, 800), true);
  let calls = 0;
  const guarded = licensedModelFetch(config, async () => { calls++; return new Response("ok"); }, () => now);
  const results = await Promise.allSettled(Array.from({ length: 10 }, () => guarded("https://example.test/guide")));
  assert.equal(results.filter(r => r.status === "fulfilled").length, 2);
  assert.equal(calls, 2);
  assert.equal((sql.prepare("SELECT COUNT(*) AS n FROM pauseam_model_usage").get() as { n: number }).n, 799);
  assert.deepEqual(Object.keys(sql.prepare("SELECT * FROM pauseam_model_usage LIMIT 1").get()!), ["id", "reserved_at"]);
  // Both the hold and the actual reservations expire; no manual reset needed.
  assert.equal(migrationCeiling(config, now + MODEL_USE_WINDOW), 950);
  await licensedModelFetch(config, async () => new Response("ok"), () => now + MODEL_USE_WINDOW)("https://example.test/guide");
  sql.close();
});

test("missing migration configuration or unavailable storage prevents transmission", async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => { calls++; return new Response("ok"); };
  const { sql, db } = ledger();
  const now = Date.parse("2026-10-11T21:00:00Z");
  const valid = { DB: db, MODEL_LEGACY_USER_UPPER_BOUND: "100", MODEL_LEGACY_HOLD_UNTIL: "2026-11-10T21:00:00Z" };
  for (const config of [ {}, { DB: db }, { ...valid, MODEL_LEGACY_USER_UPPER_BOUND: "-1" }, { ...valid, MODEL_LEGACY_HOLD_UNTIL: "invalid" }, { ...valid, MODEL_LEGACY_USER_UPPER_BOUND: "1001" }, { ...valid, DB: undefined }, { ...valid, MODEL_LEGACY_USER_UPPER_BOUND: "1000" } ]) {
    await assert.rejects(licensedModelFetch(config, fetcher, () => now)("https://example.test/transcribe"));
  }
  assert.equal(calls, 0);
  assert.equal((sql.prepare("SELECT COUNT(*) AS n FROM pauseam_model_usage").get() as { n: number }).n, 0);
  sql.close();
});

test("failed upstream request keeps its timestamp reservation", async () => {
  const { sql, db } = ledger();
  const now = Date.parse("2026-10-11T21:00:00Z");
  const config = { DB: db, MODEL_LEGACY_USER_UPPER_BOUND: "100", MODEL_LEGACY_HOLD_UNTIL: "2026-11-10T21:00:00Z" };
  await assert.rejects(licensedModelFetch(config, async () => { throw Error("offline"); }, () => now)("https://example.test/guide"), /offline/);
  assert.equal((sql.prepare("SELECT COUNT(*) AS n FROM pauseam_model_usage").get() as { n: number }).n, 1);
  sql.close();
});
test("actual SQLite conditional insert carries legacy reservation and caps queued calls", async () => {
  const { sql, db } = ledger();
  const now = LEGACY_RESERVED_AT + 1000;
  for (let i = 0; i < 947; i++) assert.equal(await reserveUsage(db, now), true);
  const results = await Promise.all(
    Array.from({ length: 12 }, () => reserveUsage(db, now)),
  );
  assert.equal(results.filter(Boolean).length, 2);
  assert.equal(await reserveUsage(db, now), false);
  assert.equal(
    (
      sql.prepare("SELECT COUNT(*) AS n FROM pauseam_model_usage").get() as {
        n: number;
      }
    ).n,
    949,
  );
  assert.equal(await reserveUsage(db, now + MODEL_USE_WINDOW), true);
  sql.close();
});
test("quota endpoint rejects weak config, missing auth and unavailable storage without calls", async () => {
  const token = "test-only-credential".repeat(3);
  const url = "https://example.test/api/model-quota";
  const request = (auth?: string) =>
    new Request(url, {
      method: "POST",
      headers: auth ? { Authorization: auth } : {},
    });
  assert.equal((await handleQuota(request(), {})).status, 503);
  assert.equal((await handleQuota(request(), { token })).status, 401);
  assert.equal(
    (await handleQuota(request("Bearer " + token), { token })).status,
    503,
  );
  const failure = {
    prepare: () => ({ bind: () => null }),
    batch: async () => {
      throw Error("test database failure");
    },
  } as unknown as D1Database;
  const response = await handleQuota(request("Bearer " + token), {
    token,
    db: failure,
  });
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(
    ((await response.json()) as { reserved: boolean }).reserved,
    false,
  );
});
test("authenticated endpoint creates only a timestamp reservation", async () => {
  const { sql, db } = ledger();
  const token = "unit-test-only".repeat(4);
  const response = await handleQuota(
    new Request("https://example.test/api/model-quota", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
    }),
    { token, db },
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { reserved: true, limit: 950 });
  assert.equal(
    sql.prepare("SELECT * FROM pauseam_model_usage").all().length,
    1,
  );
  sql.close();
});
