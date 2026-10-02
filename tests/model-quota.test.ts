import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import {
  handleQuota,
  reserveUsage,
  LEGACY_RESERVED_AT,
  MODEL_USE_WINDOW,
} from "../lib/model-quota.ts";

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
