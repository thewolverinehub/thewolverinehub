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

### Next (Phase 2 — Railway setup)

### Decisions locked
- **Hero headline:** Option B — "WHERE IRON MEETS INSTINCT."
- **Brand voice:** The Dark Coach — confirmed
- **Hero video:** AI-generated for dev phase; real production video before go-live
- **Sound:** Off by default; hero video always muted
- **Easter egg:** Konami slash storm — decision pending

### Open Issues
- Easter egg (Konami code slash storm): confirm include or exclude before Phase 7
