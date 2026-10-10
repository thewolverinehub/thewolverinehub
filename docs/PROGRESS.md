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

### /schedule (section below hero)
- Rebuilt: live Sri Lanka clock (Asia/Colombo, GMT+5:30), next-up / live-now banner, dated day tabs (Today marker, arrow-key nav), richer class cards (time+duration, intensity stripe, coach avatar, room, spots, Live/Starting soon/Finished status), class filter chips, Day/Week toggle with heat-grid week overview, URL state (?day=&class=&view=)
- All now/today/dates come from `lib/utils/colombo.ts` (never server/device tz); status logic in `lib/utils/schedule.ts`
- Removed stale `components/twh-schedule-page.css`
- **Data issue:** the 39 schedule slots in Strapi have no class or coach linked (Phase 6 dedupe / coach swap). Page falls back to "Class session". Needs relink (script ready, awaiting approval to modify live DB)

### Two-coach cleanup + schedule data (2026-10-06)
- Client has **2 coaches** (Dilshan Wickramasinghe, Sachini Perera). All 39 schedule slots relinked to a class + coach (Dilshan: boxing/striking/grappling/MMA; Sachini: strength + yoga). Old coach names removed from class text, testimonials, blog posts/author, fallbacks and seed. Home stat "Expert Coaches" = 2.
- Class "Strength & Conditioning" renamed **Strength Training** (CMS name limit 20; slug unchanged) with a 48-char tagline.
- Seed hardening: `patchClassContent` no longer overwrites existing class content (admin edits stick); one-time stat patch only touches the old seeded value 18. BOOTSTRAP_VERSION bumped to 2026-10-05-v1 (first boot after a bump takes long against a remote DB).
- Page transition fixes: Back-button (bfcache) restore resets the curtain + link lock; Ctrl/Cmd/middle-click no longer hijacked; 8s safety reset.
- Ghost button hover is now blue (distinct from the yellow primary).
- **Planned:** login replaces the Free Trial CTA; logged-in users book classes + pay (PayHere) — see Phase 12.

### FAQ + stylesheet cleanup (2026-10-06)
- **FAQ data:** 17 rows -> 13 unique questions (4 duplicates removed); every FAQ re-linked to its category (links had been lost). **FAQ page:** featured "Most asked" cards no longer repeat in the accordion ("More questions"); category pills only list categories that have questions.
- **Stylesheets:** each page now has ONE stylesheet in `styles/pages/`. The four stale `components/twh-{coaches,pricing,contact,blog}-page.css` files (globally imported, overlapping the page files) were merged into `pages/twh-coaches-page|coach-detail|pricing-page|contact|blog|article.css` and deleted. Verified lossless: 0 computed-style differences on 9 pages at 1440/820/390 px. Merge tool lived in the scratchpad (PostCSS cascade flatten).
- Page stylesheets for these pages are `<style is:global>` (unique `twh-` prefixes).

### /schedule realtime (2026-10-06)
- Live Sri Lanka clock now ticks every second (aligned to the real second); date, Today marker, class statuses and next-up refresh automatically with no reload. Countdown switches to a ticking mm:ss in the last 10 minutes; Live/Finished flip exactly at the minute.
- Midnight rollover: dates re-label, Today moves, and the open tab follows the new day (unless the visitor picked another day).
- Clock is corrected against the server (/api/health, min-RTT sampling) so a wrong device clock/timezone cannot matter; resyncs on focus / tab visible / back-forward cache restore / online and every 10 min.

### Pay-per-class pivot (2026-10-06)
- **Model:** no memberships/programs. Each class has its own `price` (LKR, 0 = free); members book one dated session and pay per session. Programs page, content type usage, pricing tiers and passes removed (`/programs` -> `/classes` 301; `/free-trial` -> `/register`). `/pricing` is now "Class Pricing".
- **Data:** 12 real classes from `TWH Classes.xlsx` (prices, coaches, target areas, equipment, dummy times) and 25 rebuilt schedule slots; coaches replaced by the two real ones (Malshan Jayasekara, Amanda). One-time idempotent migration `cms/src/bootstrap/catalog-v2.ts` (plugin-store flag `catalog-v2`). **It already ran against the shared DB, so the live site has the new data.**
- **Auth:** register / login / logout / forgot / reset (signed HttpOnly cookie `twh_session`, set `SESSION_SECRET` on Railway web). Header CTA = "Sign In / Sign Up" -> "My Account".
- **Account area** `/account` (overview, bookings, payments, profile + password).
- **Booking engine (CMS):** `booking`, `payment`, `email-log` collections; 15-min seat hold, capacity enforced under a DB advisory lock, cancel >= 12h before, 30-day window.
- **Payments:** preview simulator only (`PAYMENT_MODE=preview`); PayHere to plug into `/checkout/[orderId]`.
- **Email:** log-only (`email-log` rows). Confirmation on payment, cancellation notice, day-before reminder via cron (`ENABLE_CRON=true` on the CMS; 18:00 Colombo). Real sending needs `EMAIL_ENABLED=true` + a provider.
- **Home:** Program section replaced by the animated "Our Story" section (`sections.our-story`, GSAP; story text is dummy).
- **Verified locally:** register -> book -> preview pay -> confirmation email logged -> cancel -> cancellation email logged. astro check / eslint / build clean.
- **Cleanup done:** `program` content type + `program-tiers` component removed (old DB table left orphaned, harmless). Railway: `SESSION_SECRET` + `PAYMENT_MODE=preview` on web, `ENABLE_CRON=true` on cms.
- **TODO:** real story copy; Amanda's surname; PayHere + real email provider; mobile pass on the new pages.

### Incident + fixes (2026-10-07)
- **Cause:** setting Railway variables redeployed the live CMS on the OLD code. Local and live share one Postgres, so the old CMS's schema sync dropped the new columns/tables (class price/frequency/targetAreas/equipment, class-coach links, bookings/payments/email-logs, user fields) and its legacy seed re-created the old home page, programs page and pricing tiers. Local Strapi then threw "relation ... does not exist" and class pages failed.
- **Repair:** one-off bootstrap steps (`restoreClassData`, partial `runCatalogV2(only)`; flags `catalog-v2-class-restore-1`, `catalog-v2-reapply-1`) restored class data and re-applied home/programs/pricing cleanup. Verified via REST.
- **Rule:** never redeploy/restart the live CMS (including setting env vars) while it runs older code than local — push first. Keep scratch files OUTSIDE `cms/` (the file watcher restarts Strapi).
- **UI:** Our Story active card now lights up (reveal tween was pinning inline opacity); classes filter back to Level + Intensity (level "all" matches any level).

### Account hardening + polish (2026-10-10)
- **Tested signed-in as a real user in the browser:** register, sign in (username + email), dashboard, schedule -> review -> checkout -> pay / fail / cancel payment, paid + free bookings, cancel (with refund), profile save + persistence, password change (wrong / mismatch / success), sign out (sidebar + header + menu + Back button).
- **Fixed:** profile/password forms were unstyled (field CSS was not loaded in the account layout); cancel used a 4-second "tap again" button that silently timed out -> now a confirmation dialog stating the refund; mobile account pages scrolled sideways (grid `1fr` + nowrap tabs); `/contact` overflow; footer column alignment + wordmark clipping; mobile menu bar hidden under the floating pill; auth hero compacted on phones; global `overflow-x: clip` safety net.
- **Sign out everywhere:** header account dropdown (Overview, Bookings, Payments, Messages, Profile, Sign out), menu bar links on mobile; pages restored from the back/forward cache reload so a signed-out user never sees a stale account page.
- **Dummy payments/emails made visible:** cancelling a paid booking marks the payment `refunded` (refund details stored in `rawPayload`) and the cancellation email states the (test-mode) refund; new **Messages** tab (`/account/messages`, CMS `GET /api/bookings/messages`) shows every email the member would have received.
- **Menu:** "Our Story" removed from the header menu (CMS data + fallbacks); it remains a home-page section.
- **Social icons:** new `SocialLinks.astro` (real SVG glyphs, brand-colour hover, 44px targets) used in footer + menu; coach Instagram buttons use the icon. WhatsApp/TikTok icons appear automatically once their URLs are set in Strapi (Global).
- **Gotcha:** a new GET route in `notify` did not register; the same endpoint works under `bookings/` (`01-custom-booking.ts`). Never put scratch files in `cms/` (restarts Strapi).

### Classes filter, class content, Pricing / Contact / FAQ redesign (2026-10-10)
- **Classes page:** Intensity filter and the card intensity badge removed. Filters are **All + Level** only (strict match; 2x2 grid on phones). Intensity is shown on each class page (badge + info row). Levels are placeholder values set in Strapi.
- **Single class pages — all fields filled with dummy data** so the client can see how it works: thumbnail, gallery (4 images + video), preview/featured video, "What to expect" (new section on the page), SEO title/description, price, coaches, targets, equipment. Media was generated locally (sharp + a tiny MP4 encoder, not part of the repo) and uploaded to Strapi; every dummy file is captioned "Dummy media — replace in the Strapi media library". Cover image added at the top of the class page.
- **Pricing (new UI):** hero with live price range, filterable "rate ladder" bars (animated), interactive **Plan your week** calculator (weekly + monthly estimate, links to the schedule), billing rules, billing FAQ, CTA. All driven by class prices in Strapi.
- **Contact (new UI):** live Open-now status in Sri Lanka time + today's hours highlighted, one-tap WhatsApp/Call/Email/Directions tiles with copy buttons, topic picker that tailors the form, preferred contact method, character counter, animated success state, visit card + social icons. Still posts to `/api/contact` (topic + preference are added to the message).
- **FAQ (new UI):** live search with highlighting and "/" shortcut, topic rail with counts, expand/collapse all, deep links (`#q-…`) + copy link, popular chips, "still stuck?" card. FAQs were not linked to categories in the data; fixed (14 FAQs now sit in Getting started / Booking & payments / Facilities).
- **CMS copy:** contact hero no longer mentions "free trial" (one-off bootstrap step `patchHeroCopy`, flag `hero-copy-1`). BOOTSTRAP_VERSION is `2026-10-10-v1`.

### Multi-session basket, PDF receipts, contact leads, pricing board (2026-10-10)
- **One order, many sessions.** A member can collect sessions from any classes/days and pay once: one payment, one confirmation email listing every session, one PDF receipt. Added `booking.orderId` (bookings paid together share it); `payment.booking` still points at the first booking. CMS: `reserveMany` (locks every slot, replaces the member's own unfinished holds, max 12 sessions), `completePayment`/`failPayment` act on the whole order, `cancelBooking` refunds **just that session** (payment stays `paid` until every session is cancelled; refunds are listed in `payment.rawPayload.refunds`).
- **Basket (web):** `BasketBar` (floating, every page), `/basket` page (review, remove, "add more sessions" picker via `?classes=a,b`, pay), "Add" toggles on class pages (16 upcoming sessions, "Book only this" still available) and on the schedule. Stored in the browser (`twh-basket-v1`); the server re-validates everything.
- **Pricing:** rate bars replaced by **price tickets** (tier-coloured, filterable, "+ Plan" feeds the planner); planner CTA is now "Pick dates & book" -> `/basket?classes=...`.
- **PDF receipt:** `cms/src/utils/receipt.ts` (pdf-lib, no fonts to ship). `GET /api/bookings/receipt` -> web proxy `/account/receipt/:orderId`; linked from the bookings banner, each booking row and Payments. Attached to the confirmation email when a real provider is connected (always noted in the Email Log).
- **Contact:** the three "best way to reach you" buttons are an equal-width segmented control aligned to the inputs. Leads now store `topic` + `preferredContact`; a lead lifecycle emails the business (`CONTACT_NOTIFY_EMAIL`, else the email in Global) and sends the visitor an acknowledgement — both logged in Email Log until a provider is connected.
- **E2E check (20 assertions):** 4 sessions / 3 classes in one order -> one checkout -> one payment -> one email (+PDF) -> partial cancel -> lead + 2 emails. All pass.
- **Deploy note:** adds columns (`bookings.order_id`, `leads.topic`, `leads.preferred_contact`) to the shared DB — push before the live CMS restarts (see "shared DB" rule).
