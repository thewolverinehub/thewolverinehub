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
- Strapi 5.55.1, all 42 content types, 27 components, permissions bootstrap
- Both services live and healthy on Railway
- Admin account created, read-only API token set on web service
- CI fully working (public repo): gitleaks + npm audit + CodeQL + lint/build

### Decisions locked
- Hero headline: "WHERE IRON MEETS INSTINCT."
- Brand voice: The Dark Coach
- Hero video: AI-generated for dev phase
- Sound: Off by default, hero video always muted
- Easter egg (Konami slash storm): decision pending before Phase 7

### Open Issues
- Full dummy seed data (spec §13.6) — extend before Phase 13
- Strapi Preview config — complete in Phase 5 once preview route exists
- Easter egg: confirm before Phase 7

---

## Phase 5 — Astro foundation (IN PROGRESS)

**Date:** 2026-09-30
**Status:** In progress

### Tasks
- [ ] Install Tailwind CSS v4 + brand tokens in `global.css`
- [ ] Self-hosted fonts (Anton/Bebas Neue + Inter/Manrope), fluid type scale
- [ ] Layouts: BaseLayout, PageLayout, ArticleLayout, LegalLayout
- [ ] Typed Strapi client (`lib/strapi/`) + Redis cache-aside
- [ ] SEOHead component + JSON-LD builders (ExerciseGym, LocalBusiness, BreadcrumbList, FAQPage, Article)
- [ ] Middleware: security headers, noindex, redirects, origin check
- [ ] Media proxy (`pages/media/[...path].ts`) with Range support
- [ ] API endpoints: health, revalidate (HMAC), preview, search
- [ ] env-aware robots.txt + sitemap.xml from Strapi
- [ ] 404 and 500 pages driven by Strapi ui-strings
- [ ] `/styleguide` dev page (excluded from production)
