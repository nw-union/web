// Cloudflare Secrets の型定義
// wrangler types で生成されない Secret を手動で定義
declare namespace Cloudflare {
  interface Env {
    YOUTUBE_API_KEY: string;
  }
}
