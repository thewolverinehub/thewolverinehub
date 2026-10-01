# Build Progress — The Wolverine Hub

---

## Phase 0 — Discovery
**Date:** 2026-09-30 | **Status:** Complete ✓

## Phase 1 — Repository and local stack
**Date:** 2026-09-30 | **Status:** Complete ✓

## Phase 2 — Railway
**Date:** 2026-09-30 | **Status:** Complete ✓
- Web: `https://web-production-2a3c3.up.railway.app`
- CMS: `https://cms-production-3644.up.railway.app`

## Phase 3 — Lighthouse CI baseline
**Date:** 2026-09-30 | **Status:** Complete ✓
- Minimal Astro 7.3.5 app, /api/health, mobile + desktop LHCI

## Phase 4 — Strapi CMS
**Date:** 2026-09-30 | **Status:** Complete ✓
- Strapi 5.55.1, all 29 content types, permissions bootstrap via `strapi.db.query`
- Both services live and healthy on Railway
- Admin account created, Full Access API token set on web service (`STRAPI_API_TOKEN`)
- CI fully working (public repo): gitleaks + npm audit + CodeQL + lint/build
- **Strapi v5 note:** `roleService.findOne()` never returns `api::*` actions — permissions created directly via `strapi.db.query`; Full Access token bypasses permission tree entirely
- Seed data: global, header, footer, ui-strings, classes, coaches, pricing tiers, passes, testimonials, FAQs all published

### Decisions locked
- Hero headline: "WHERE IRON MEETS INSTINCT."
- Brand voice: The Dark Coach
- Hero video: AI-generated for dev phase
- Sound: Off by default, hero video always muted
- Easter egg (Konami slash storm): decision pending before Phase 7

### Open Issues
- Full dummy seed data (spec §13.6) — extend before Phase 13
- Strapi Preview config — complete once preview route exists
- Easter egg: confirm before Phase 7

---

## Phase 5 — Astro foundation
**Date:** 2026-09-30 | **Status:** Complete ✓

### Built
- Tailwind CSS v4 + brand tokens (`--twh-*`) in `global.css`
- Self-hosted fonts; fluid type scale
- Layouts: BaseLayout, PageLayout, ArticleLayout, LegalLayout
- Typed Strapi client (`lib/strapi/`) with Redis cache-aside (10 min TTL)
- SEOHead + JSON-LD builders (ExerciseGym, LocalBusiness, BreadcrumbList, FAQPage, Article)
- Middleware: security headers (CSP, HSTS, COOP, Referrer-Policy), noindex, redirects, origin check
- Media proxy (`pages/media/[...path].ts`) with Range support
- API endpoints: `/api/health`, `/api/revalidate` (HMAC), `/api/search`
- env-aware `robots.txt` + `sitemap.xml` from Strapi
- 404 and 500 pages driven by Strapi ui-strings
- `/styleguide` dev page
- Homepage (`/`) with 9 section components — all CMS-driven: HeroVideo, StatCounters, Marquee, ClassRail, FeatureSplit, CoachCarousel, PricingTeaser, TestimonialSlider, CTABanner
- Header, Footer, AnnouncementBar, SlashMenu, slash-menu JS interactions

### Open Issues
- Preview API endpoint (`/api/preview`) — add when preview route is needed
- Inner pages (classes, schedule, programs, coaches, pricing, etc.) — Phase 6+
