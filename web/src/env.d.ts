// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL: string;
  readonly CMS_PUBLIC_URL: string;
  readonly CMS_INTERNAL_URL: string;
  readonly STRAPI_API_TOKEN: string;
  readonly REVALIDATE_SECRET: string;
  readonly REDIS_URL: string;
  readonly BUCKET_ENDPOINT: string;
  readonly BUCKET_REGION: string;
  readonly BUCKET_ACCESS_KEY_ID: string;
  readonly BUCKET_SECRET_ACCESS_KEY: string;
  readonly BUCKET_NAME: string;
  readonly BUCKET_FORCE_PATH_STYLE: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY: string;
  readonly TURNSTILE_SECRET_KEY: string;
  readonly PAYMENT_MODE: "preview" | "sandbox" | "live";
  readonly EDGE_CHECK: string;
  readonly TWH_EDGE_SECRET: string;
  readonly SITE_INDEXING: string;
  readonly GO_LIVE_DATE: string;
  readonly SESSION_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Per-request values set by src/middleware.ts
declare namespace App {
  interface Locals {
    /** Signed-in member (from the signed session cookie) — null when logged out. */
    session: { uid: number; name: string } | null;
  }
}
