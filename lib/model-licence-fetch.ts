import { MODEL_USE_LIMIT, reserveUsage } from "./model-quota.ts";

export type ModelLicenceConfig = {
  DB?: D1Database;
  MODEL_LEGACY_USER_UPPER_BOUND?: string;
  MODEL_LEGACY_HOLD_UNTIL?: string;
};

// Prior-user allowance is a conservative migration hold, not fabricated usage
// rows or validation evidence. Only actual new request timestamps enter D1.
export function migrationCeiling(config: ModelLicenceConfig, now = Date.now()) {
  const raw = config.MODEL_LEGACY_USER_UPPER_BOUND || "";
  const until = config.MODEL_LEGACY_HOLD_UNTIL || "";
  if (!/^(0|[1-9]\d{0,3})$/.test(raw) || Number(raw) > 1000 ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(until) ||
      !Number.isFinite(Date.parse(until)))
    throw Error("quota_unavailable");
  return now < Date.parse(until)
    ? Math.min(MODEL_USE_LIMIT, 1000 - Number(raw))
    : MODEL_USE_LIMIT;
}

// The website's durable ledger survives model-host replacement. Reserve only
// at the actual outbound inference call; local guidance never needs a slot.
export function licensedModelFetch(
  config: ModelLicenceConfig,
  fetcher: typeof fetch = fetch,
  clock: () => number = Date.now,
): typeof fetch {
  return async (input, init) => {
    if (!config.DB) throw Error("quota_unavailable");
    const now = clock();
    const ceiling = migrationCeiling(config, now);
    let reserved: boolean;
    try {
      reserved = await reserveUsage(config.DB, now, ceiling);
    } catch {
      throw Error("quota_unavailable");
    }
    if (!reserved) throw Error("quota");
    // A failed or cancelled request keeps its reservation: retrying cannot
    // release capacity and race another request into the model.
    return fetcher(input, init);
  };
}
