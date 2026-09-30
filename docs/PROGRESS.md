# Build Progress — The Wolverine Hub

---

## Phase 0 — Discovery

**Date:** 2026-09-30  
**Status:** Complete — awaiting checkpoint approval

### Done
- Crawled inner pages of both reference sites (lokalankafitness.com and makahiyafitness.com): home, schedule, classes, pricing, personal-training, about, testimonials, packages, classes, faqs, gallery, contact
- Wrote `docs/reference-analysis.md` — full structural breakdown and gap analysis
- Wrote `docs/creative-direction.md` — concept, motion principles, colour application, menu spec, Awwwards framework, open questions
- Proposed 3 hero headline options with rationale (see creative-direction.md §3)
- Proposed tone-of-voice archetype: "The Dark Coach" (see creative-direction.md §2)

## Phase 1 — Repository and local stack

**Date:** 2026-09-30
**Status:** Complete ✓ — pushed to `main`

### Done
- Git init + GitHub remote (`https://github.com/thewolverinehub/thewolverinehub`)
- Full folder structure per spec §6
- `.gitignore`, `.gitattributes`, `.editorconfig`, `.nvmrc` (Node 22 LTS)
- `CLAUDE.md` with all project conventions
- `docker-compose.yml` (PostgreSQL 16, Redis 7, MinIO)
- `docker/minio-init.sh` (bucket + service account creation)
- `scripts/setup.ps1` (prerequisites, Docker start, .env copy, npm install)
- GitHub Actions: `ci.yml` (path-filtered), `security.yml` (gitleaks, audit, CodeQL), `lighthouse.yml`
- `.lighthouserc.js` (≥90 all categories, mobile + desktop)
- Dependabot (web, cms, actions — weekly)
- PR template + bug report issue template
- All `docs/` stubs: architecture, data-sync, deployment, security, content-guide, go-live-checklist
- `README.md` placed at repo root
- First commit pushed: `27ae03c`

## Phase 2 — Railway

**Date:** 2026-09-30
**Status:** Complete ✓

### Done
- Railway project created: `the-wolverine-hub` (ID: `ce0d9d7c-fd84-4011-9b4c-416750fc188d`)
- Services provisioned: PostgreSQL 16, Redis 7, Bucket (Singapore / `sin` region)
- `cms` service — root `/cms`, build `npm run build`, start `npm run start`, health `/_health`
- `web` service — root `/web`, start `node ./dist/server/entry.mjs`, health `/api/health`
- Public domains generated:
  - Web: `https://web-production-2a3c3.up.railway.app`
  - CMS: `https://cms-production-3644.up.railway.app`
- Private networking active: `cms.railway.internal`, `web.railway.internal`
- All environment variables set on both services (17 on cms, 15 on web)
- "Wait for CI" (checkSuites) enabled on both deployment triggers
- `cms/.env.example` and `web/.env.example` written
- Railway CLI installed + MCP configured

### Open Issues
- `STRAPI_API_TOKEN` on web is a placeholder — update after Phase 4 (Strapi) boots for the first time
- `REVALIDATE_SECRET` on web not yet set — add when webhook is configured in Phase 4

### Next (Phase 3 — Lighthouse CI baseline)

### Decisions locked
- **Hero headline:** Option B — "WHERE IRON MEETS INSTINCT."
- **Brand voice:** The Dark Coach — confirmed
- **Hero video:** AI-generated for dev phase; real production video before go-live
- **Sound:** Off by default; hero video always muted
- **Easter egg:** Konami slash storm — decision pending

### Open Issues
- Easter egg (Konami code slash storm): confirm include or exclude before Phase 7


