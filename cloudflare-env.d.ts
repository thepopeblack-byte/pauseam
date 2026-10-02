declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    QUOTA_SERVICE_TOKEN?: string;
  }
}
