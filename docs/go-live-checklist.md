# Go-Live Checklist

_To be executed in Phase 13_

---

## Content

- [ ] Dummy data cleared (`npm run seed:clear` in `cms`)
- [ ] Real content entered in live Strapi admin
- [ ] All images have alt text
- [ ] All pages have meta title, meta description, and OG image set in Strapi
- [ ] Legal pages (Terms, Privacy, Refund Policy) reviewed and approved
- [ ] Hero video encoded and uploaded (WebM + MP4, ≤ 3 MB, poster image set)
- [ ] Final `sync:push` executed (if content was built locally)
- [ ] Backups verified (DB dump + media bucket copy)

## Railway — domain and variables

- [ ] Custom domains added in Railway (`thewolverinehub.com`, `www`, `cms.thewolverinehub.com`)
- [ ] `PUBLIC_SITE_URL` updated to `https://thewolverinehub.com`
- [ ] `CMS_PUBLIC_URL` updated to `https://cms.thewolverinehub.com`
- [ ] Strapi `url` config updated
- [ ] CORS origins updated
- [ ] CSP updated with real domains
- [ ] Upload provider base URL updated
- [ ] Turnstile allowed hostnames updated
- [ ] `EDGE_CHECK=true`
- [ ] `SITE_INDEXING=true`
- [ ] `PAYMENT_MODE=live` (after sandbox test passes)
- [ ] `GO_LIVE_DATE` set (disables sync:push)
- [ ] Redeployed both services

## Cloudflare

- [ ] DNS records added (@ → web, www → web, cms → cms); proxied
- [ ] SSL mode: Full (strict) — only after Railway certificates issued
- [ ] HTTPS enforced, TLS 1.2+
- [ ] 301 www → apex redirect
- [ ] HSTS enabled (after HTTPS verified)
- [ ] Origin check header Transform Rule configured
- [ ] WAF managed rules enabled
- [ ] Bot Fight Mode enabled
- [ ] Rate limit rules: `/_actions/*`, `/api/*`, `/partials/*`, `/login`, `cms.*/admin/login`
- [ ] Cache Rules: `/media/*`, `/_astro/*`
- [ ] Turnstile widget hostnames updated
- [ ] Cloudflare Web Analytics enabled
- [ ] Email DNS (SPF, DKIM, DMARC) configured

## SEO and indexing

- [ ] Lighthouse `is-crawlable` skip removed from `lighthouse.yml`
- [ ] robots.txt returns `Allow: /` (not `Disallow: /`)
- [ ] Sitemap at `/sitemap.xml` generates correctly with all routes
- [ ] Sitemap submitted to Google Search Console
- [ ] Sitemap submitted to Bing Webmaster Tools
- [ ] Structured data (LocalBusiness, ExerciseGym) valid in Rich Results Test

## Quality

- [ ] Lighthouse ≥ 90 all categories on mobile AND desktop on real domain (all key pages)
- [ ] No console errors on any page
- [ ] Cross-browser check (Chrome, Safari iOS, Firefox, Samsung Internet)
- [ ] Security headers scan: A+ on securityheaders.com and Mozilla Observatory
- [ ] Broken links scan clean

## Payments

- [ ] PayHere merchant account configured for `thewolverinehub.com`
- [ ] `PAYMENT_MODE=sandbox` end-to-end test passed on Railway (all status codes)
- [ ] `PAYMENT_MODE=live` set; small real test purchase made and refunded
- [ ] Receipt emails working
- [ ] Refund policy page live and linked from checkout

## Final

- [ ] Uptime alerts configured
- [ ] Railway dev links redirected (301) or public domain removed
- [ ] Tag `v1.0.0` created in git
