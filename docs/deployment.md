# Deployment — Railway + Cloudflare

_Stub — to be completed in Phase 2 (Railway) and Phase 13 (Cloudflare go-live)_

---

## Railway (Phase 2)

<!-- TODO: Document Railway project setup, service configuration, environment variables, private networking, health checks -->

## Pre-launch (Railway dev links)

- Site runs on Railway-generated public domains
- `SITE_INDEXING=false` — X-Robots-Tag: noindex on all responses
- No Cloudflare, no real domain
- Strapi admin protected by login + rate limit

## Cloudflare (Phase 13 — go-live only)

<!-- TODO: Document DNS setup, SSL Full (strict), origin check header, WAF rules, cache rules, Turnstile, Cloudflare Analytics -->

## Go-live checklist

See `docs/go-live-checklist.md`
