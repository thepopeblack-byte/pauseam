import { handleQuota } from "@/lib/model-quota";
// Service-to-service only. No participant input is accepted or stored here.
export async function POST(request: Request) {
  try {
    const { env } = await import("cloudflare:workers");
    return handleQuota(request, { db: env.DB, token: env.QUOTA_SERVICE_TOKEN });
  } catch {
    return handleQuota(request, {});
  }
}
