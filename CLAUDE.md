# CLAUDE.md — The Wolverine Hub

Single source of truth for conventions, rules, and context for every AI-assisted session on this codebase.

---

## Project overview

| Item | Value |
|---|---|
| Site | The Wolverine Hub — premium gym and training centre website |
| Repo root (local) | `D:\Side Projects\Local\thewolverinehub\website` |
| GitHub | `https://github.com/thewolverinehub/thewolverinehub` |
| Front-end | Astro (SSR, Node adapter) + Tailwind CSS v4 + TypeScript |
| Motion / 3D | GSAP (ScrollTrigger, ScrollSmoother, SplitText, Flip) + Three.js + GLSL |
| CMS | Strapi v5 (headless, PostgreSQL) |
| Hosting | Railway (`web` service + `cms` service + PostgreSQL + Redis + Bucket) |
| DNS / CDN | Cloudflare — added at go-live only |
| Payments | PayHere |

---

## Tech stack versions

Always verify latest stable before installing. Do not rely on memory for APIs that change.

| Package | Line | Notes |
|---|---|---|
| Node.js | 22 LTS | See `.nvmrc`; Strapi v5 also supports v24, v26 |
| Astro | latest stable | Check [astro.build](https://astro.build) before installing |
| Tailwind CSS | v4 | `@tailwind/vite` plugin; config lives in `global.css` `@theme` block |
| Strapi | v5 | TypeScript, PostgreSQL; use `documentId` (not `id`), flattened responses (no `data.attributes`) |
| GSAP | latest | Free plugins: ScrollTrigger, ScrollSmoother, SplitText, Flip — all in the `gsap` npm package |
| Three.js | latest stable | GLSL shaders in `web/src/assets/shaders/*.glsl` |

---

## Rules (apply every session)

1. **Plan before coding.** List tasks, files, and manual steps. Wait for "go" at `[CHECKPOINT]` phases.
2. **Check docs before installing.** Verify versions against official docs (Astro adapters/CSP/Actions, Strapi v5 response shape, Tailwind v4 config).
3. **Git discipline.** After every completed task: lint + type-check + build → Conventional Commit → `git push origin main`. Never leave work uncommitted.
4. **Mark manual steps** with `[MANUAL]` and give exact click-paths or commands.
5. **CMS-first — zero hard-coded content.** If a visible string, image, link, or SEO value is not coming from Strapi, it is a bug. The only exception: last-resort fallback text when Strapi is unreachable.
6. **Dummy data now, real data later.** Seed realistic dummy content via `npm run seed`.
7. **Ask before anything destructive** (dropping tables, deleting bucket objects, force-pushing, changing DNS, pushing local data to live).
8. **Keep `docs/PROGRESS.md` updated** after every task.
9. **No jQuery.** All dynamic behaviour: vanilla TypeScript + GSAP.
10. **Windows environment.** Paths contain spaces — always quote. Scripts must work in PowerShell and Git Bash.
11. When substantially changing a CSS or JS file, output the complete file, not a partial diff.

---

## Naming conventions

| Context | Convention | Example |
|---|---|---|
| Asset files | kebab-case | `hero-boxing-01.avif` |
| Astro/TS components | PascalCase | `ClassCard.astro` |
| Custom CSS classes | `twh-` prefix | `twh-btn-primary` |
| CSS files | `twh-*.css` per component family | `twh-cards.css` |
| Strapi content types | kebab-case | `schedule-slot` |
| Conventional Commits | `feat(web):`, `fix(cms):`, `chore(infra):`, `docs:` | |

---

## Directory structure (summary)

```
website/
├── web/        Astro front-end — independent Node project
├── cms/        Strapi v5 CMS — independent Node project
├── docs/       Architecture, progress, data-sync, deployment, security, content guides
├── scripts/    Repo-level helpers (setup.ps1, db-backup.ps1, media-encode.ps1)
├── docker/     Local service init scripts
├── backups/    git-ignored
└── .github/    CI workflows, Dependabot, templates
```

Full file tree in the master prompt §6.

---

## Environments

| | Local | Live (Railway `production`) |
|---|---|---|
| Web | `http://localhost:4321` | Railway dev link → `https://thewolverinehub.com` at go-live |
| CMS | `http://localhost:1337/admin` | Railway dev link → `https://cms.thewolverinehub.com/admin` |
| Database | Railway PostgreSQL (public TCP proxy) | Railway PostgreSQL (private network) |
| Media | Railway Bucket (shared) | Railway Bucket |
| Cache | Redis not required locally | Railway Redis |
| Payments | `PAYMENT_MODE=preview` | `sandbox` → `live` |
| Indexing | off | `SITE_INDEXING=false` until go-live |

**No Docker required.** Both local and live share Railway PostgreSQL via the public TCP proxy (`metro.proxy.rlwy.net:38232`). Media uploads go directly to the Railway Bucket.

**Never hard-code a domain.** All URLs come from environment variables: `PUBLIC_SITE_URL`, `CMS_PUBLIC_URL`, `CMS_INTERNAL_URL`.

---

## CSS architecture

- `web/src/styles/global.css` — Tailwind v4 `@import` + `@theme` tokens + table of contents
- Custom classes prefixed `twh-` — never conflict with Tailwind utilities
- Each custom stylesheet is a single source of truth with named sections and a table of contents at the top
- No inline styles except for GSAP-controlled dynamic values

### Brand tokens (Tailwind `@theme`)

```css
--twh-black:      #0A0A0B   /* main background */
--twh-ink:        #141418   /* raised surfaces, cards */
--twh-white:      #FFFFFF   /* primary text */
--twh-red:        #D7141A   /* slash marks, hover, highlights */
--twh-red-deep:   #8E0B10   /* gradients, pressed */
--twh-yellow:     #FFC20E   /* primary CTA, key numbers, focus ring */
--twh-blue:       #1B3F94   /* section bands, menu panels, cards */
--twh-blue-deep:  #0B2359   /* gradients, overlays */
```

---

## Motion rules (non-negotiable)

- Animate only `transform`, `opacity`, and `clip-path` (sparingly)
- ScrollSmoother on desktop only — `smoothTouch: false`
- `prefers-reduced-motion`: disable smoother, pins, parallax, WebGL, intro, autoplay video
- WebGL lazy-loads only when hero is in view and device qualifies (`hardwareConcurrency >= 4`, no Save-Data, no reduced-motion)
- `will-change` only during an active animation; remove after
- Use `gsap.matchMedia()` for breakpoint-specific animations and cleanup

---

## Security baseline

- Strict CSP via middleware (nonces, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`)
- HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `COOP`
- All forms: Astro Actions + Zod + Turnstile (server-verified) + honeypot + rate-limit
- No raw input reflected; Strapi rich text rendered via Blocks renderer only
- Secrets in Railway variables and local `.env` only; never committed

---

## Performance budgets

| Metric | Target |
|---|---|
| Lighthouse all categories | ≥ 90 mobile AND desktop |
| LCP (mobile) | < 2.5 s |
| CLS | < 0.05 |
| INP | < 200 ms |
| Initial JS bundle (home, excl. lazy WebGL) | < 120 KB gzip |
| Hero video | ≤ 3 MB |

---

## Media rules

- Only brand fallbacks, icons, shaders, textures, and small UI images in git
- Photos and videos live in Strapi → MinIO (local) or Railway Bucket (live)
- Never commit video files, photo shoots, or the seed media folder
- Hero video: WebM (VP9/AV1) + MP4 (H.264), muted, `playsinline`, ≤ 3 MB, poster required

---

## Creative direction

| Element | Decision |
|---|---|
| Concept | PRIMAL PRECISION |
| Hero headline | "WHERE IRON MEETS INSTINCT." |
| Brand voice | The Dark Coach — authoritative, cinematic, quietly menacing |
| Signature device | Three parallel diagonal slashes at ~35° |
| Menu | The Slash Menu (see `docs/creative-direction.md`) |
| Hero video | AI-generated for dev phase; real production video before go-live |
| Sound | Off by default; hero video always muted |

Full spec in `docs/creative-direction.md`.

---

## Current phase

See `docs/PROGRESS.md` for the latest status and open issues.
