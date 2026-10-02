import { json } from "@/lib/server";
import { currentSafetyUpdates } from "@/lib/updates";
export async function GET() {
  const entries = currentSafetyUpdates();
  return json({
    status: entries.length ? "ok" : "unavailable",
    updates: entries.map(
      ({
        id,
        title,
        published,
        summary,
        steps,
        source,
        challenge,
        choices,
        explanation,
      }) => ({
        id,
        title,
        published,
        summary,
        steps,
        source,
        challenge,
        choices,
        explanation,
      }),
    ),
  });
}
