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

### Next (Phase 1 — after checkpoint approval)
- Git init, GitHub remote, full folder structure (§6)
- `.gitignore`, `.gitattributes`, `.editorconfig`, `.nvmrc`, `CLAUDE.md`
- Stub all docs files
- `docker-compose.yml` (Postgres + Redis + MinIO)
- `scripts/setup.ps1`
- GitHub Actions: `ci.yml`, `security.yml`, `lighthouse.yml`
- Dependabot, PR template
- First push to `main`

### Decisions locked
- **Hero headline:** Option B — "WHERE IRON MEETS INSTINCT."
- **Brand voice:** The Dark Coach — confirmed
- **Hero video:** AI-generated for dev phase; real production video before go-live
- **Sound:** Off by default; hero video always muted
- **Easter egg:** Konami slash storm — decision pending

### Open Issues
- Easter egg (Konami code slash storm): confirm include or exclude before Phase 7
