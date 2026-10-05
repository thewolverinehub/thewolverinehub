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

---

## Phase 6 — CMS data pipeline repair
**Date:** 2026-10-01 | **Status:** Complete ✓

### Root causes found and fixed
- **Missing routes/services**: All 28 content types had no `routes/` or `services/` dirs → zero REST endpoints existed. Generated `routes/<name>.ts` + `services/<name>.ts` for all types.
- **`checkSuites: true`**: Railway skipped every git-triggered deploy (no CI configured). Disabled via Railway agent.
- **`populate=deep` removed in Strapi v5**: Every API call returned 400. Changed to `populate=*` in `client.ts`.
- **`fetchList` returning wrapper**: Fixed to unwrap `.data` and return `T[]`. Updated `middleware.ts` and `api/search.ts` callers.
- **`repairPublishedOnly` causing duplicates**: Phantom draft rows were published by `publishAllContent`, doubling every content type. Added `deduplicateDocuments()` to clean DB on next boot; removed broken repair call.
- **Coach `specialties` null**: Old seed sent arrays into a `text` field → Strapi stored null. Added `patchCoachSpecialties()` to update on next boot.
- **`status=published` missing**: All API requests now include `&status=published` so Strapi v5 returns published content.

### Current live state
- CMS API: all endpoints return 200 ✓
- Web: all pages render CMS data (coaches, schedule, pricing, blog posts) ✓
- Auto-deploy on push: working (checkSuites disabled) ✓
- Local web build: clean ✓
- Local CMS: `npm run develop` in `cms/` starts Strapi against Railway DB

### Open issues
- Duplicate content records being cleaned on next CMS boot (deduplicateDocuments)
- Coach specialties being patched on next CMS boot (patchCoachSpecialties)
- Inner pages need section-by-section content review and styling pass — Phase 7

---

## Phase 7 — Inner pages
**Date:** 2026-10-02 → 2026-10-04 | **Status:** Complete ✓

> Numbering note: our "Phase 7" = inner pages, which corresponds to **Phase 8 — Pages** in `CLAUDE_CODE_PROMPT.md` §17. The master-prompt Phase 7 (motion + WebGL system) is **not yet done** beyond basic GSAP interactions.

### Built
- `/` Home, `/classes` (+ `[slug]`; redesigned card grid + CSS-class filter + empty state), `/coaches` (+ `[slug]`), `/schedule`, `/pricing`, `/blog` (+ `[slug]`), `/contact` (+ `/api/contact`), `/programs`, `/faq`, `/gallery`
- Extra section components: ClassGrid, CoachSpotlight, ProgramPanels, SectionRenderer
- `WolverineSlash` 3D claw-mark SVG replaces all decorative slash text
- Per-page stylesheets in `styles/pages/` and `styles/components/`

### Remaining / next
- Motion & WebGL system (ScrollSmoother, reveals, hero/menu shaders, cursor, magnetic buttons, lightbox, intro, sound toggle, experience toggles)
- Live filters & search (command palette, Flip, URL state, no-JS fallback)
- Forms, leads & email (free trial, PT enquiry, questionnaire, newsletter, Turnstile)
- QA & hardening, accounts & payments, real content & go-live
- Easter egg (Konami slash storm) decision still pending
- `MediaPlaceholder.astro` and `public/wolverinehub-logo.png` are committed but not referenced yet

---

## Page-by-page polish (post Phase 7)
**Date:** 2026-10-05

### /classes
- Grid: 3 cols desktop / 2 tablet / 1 mobile; taller cards
- Filter bar: larger accessible text, 44px targets, strong hover + solid selected state; stacks (no scroll) on tablet/mobile
- Cards: hover (and keyboard focus) plays `previewVideo`; click opens the class
- /classes/[slug]: class video (manual play) + photo/video gallery with lightbox (`components/ui/Lightbox.astro`)
- CMS: new `gallery` multi-media field on Class; clearer labels for Card Image / Card Hover Video / Class Video
- Page transition script skips `data-lightbox` / `data-no-transition` links
- Dev servers: `node scripts/dev-detached.mjs [stop]` (console-less, survives stray Ctrl-C)
- **Open:** no class media uploaded yet (add in Strapi: Card Image, Card Hover Video, Class Video, Gallery); class text still mentions removed coaches

### Buttons (site-wide)
- `.twh-btn` now uses a "slash sweep" hover (two -35° panels: lead colour then fill) driven by --btn-fill / --btn-lead / --btn-ink-hover per variant. Primary: yellow → red; Secondary: outline → white; Ghost: outline → yellow; Danger: red → deep red. Same engine on FAQ/gallery filter pills. Hover-capable devices only; reduced-motion = instant colour swap.
- Removed stale `components/twh-classes-page.css` (conflicting duplicate)
- **Note for page reviews:** other `components/twh-*-page.css` files duplicate `pages/twh-*.css` (coaches, pricing, schedule, blog, contact) and may conflict like classes did; FAQ page shows duplicated entries in the data.
