# The Wolverine Hub

Official website and content platform for **The Wolverine Hub**, a gym and training centre. The site presents classes, schedules, coaches, programs and memberships, captures leads, and supports online pass purchases through PayHere. Every piece of content, including the header, footer and SEO, is managed in Strapi.

> **Status:** In development. The site currently runs on Railway development links (not indexed by search engines). The `thewolverinehub.com` domain is attached at launch.

---

## Tech stack

| Layer | Technology |
|---|---|
| Front-end | [Astro](https://astro.build) (SSR, Node adapter), Tailwind CSS, custom CSS, TypeScript |
| Motion & WebGL | GSAP (ScrollTrigger, ScrollSmoother, SplitText, Flip), Three.js, GLSL shaders |
| CMS | [Strapi v5](https://strapi.io) (headless) |
| Database | PostgreSQL — local (Docker) and live (Railway) |
| Media storage | MinIO (local) and Railway Storage Bucket (live), both S3-compatible |
| Cache | Redis (+ Cloudflare edge cache after launch) |
| Hosting | [Railway](https://railway.com) |
| DNS, CDN, security | [Cloudflare](https://cloudflare.com) (WAF, edge cache — from launch), Turnstile |
| Payments | [PayHere](https://www.payhere.lk) |
| CI/CD | GitHub Actions → Railway auto-deploy |

---

## Repository structure

```
website/
├── web/                 Astro front-end (public website)
├── cms/                 Strapi v5 headless CMS
├── docs/                Architecture, data sync, deployment, security and content guides
├── scripts/             Setup, backups, media encoding
├── docker/              Local service init scripts
├── docker-compose.yml   Local PostgreSQL, Redis and MinIO
└── .github/             CI workflows, Dependabot, templates
```

`web` and `cms` are independent Node projects, each deployed as its own Railway service.

---

## Getting started (local development)

### Prerequisites
- Node.js — version in `.nvmrc`
- npm
- Git
- Docker Desktop
- Railway CLI (optional)

### 1. Clone and set up
```bash
git clone https://github.com/thewolverinehub/thewolverinehub.git
cd thewolverinehub
```
On Windows, run the setup script (starts Docker services, creates `.env` files, installs dependencies):
```powershell
.\scripts\setup.ps1
```
Or manually:
```bash
docker compose up -d
cp cms/.env.example cms/.env
cp web/.env.example web/.env
```
Never commit `.env` files.

### 2. Run the CMS
```bash
cd cms
npm install
npm run seed        # optional: load dummy content
npm run develop
```
Admin panel: `http://localhost:1337/admin`

### 3. Run the website
```bash
cd web
npm install
npm run dev
```
Website: `http://localhost:4321`

---

## Environments and data sync

| | Local | Live |
|---|---|---|
| Database | Docker PostgreSQL | Railway PostgreSQL |
| Media | MinIO | Railway Bucket |
| Payments | Preview only | PayHere sandbox → live |

- **Schema changes** (content types, fields) are code: make them locally, push to GitHub, and Railway applies them on deploy.
- **Content and media:** before launch, push local to live with `npm run sync:push` (in `cms`). It backs up live first and asks for confirmation. After launch, content is edited directly in the live CMS and `npm run sync:pull` refreshes local.

Full guide: [`docs/data-sync.md`](docs/data-sync.md)

---

## Scripts

| Location | Command | Purpose |
|---|---|---|
| `web` | `npm run dev` | Start Astro dev server |
| `web` | `npm run build` | Production build |
| `web` | `npm run check` | Type and template checks |
| `web` | `npm run lint` | Lint |
| `web` | `npm run test` | Unit tests (Vitest) |
| `web` | `npm run test:e2e` | End-to-end tests (Playwright) |
| `cms` | `npm run develop` | Start Strapi with admin auto-reload |
| `cms` | `npm run build` | Build the admin panel |
| `cms` | `npm run start` | Start Strapi in production mode |
| `cms` | `npm run seed` / `seed:clear` | Load / remove dummy content |
| `cms` | `npm run sync:push` | Local → live content and media (pre-launch only) |
| `cms` | `npm run sync:pull` | Live → local content and media |
| `cms` | `npm run backup:live` / `backup:local` | Database and media backups |

---

## Deployment

- Pushing to `main` runs GitHub Actions (lint, type-check, tests, build, security scans).
- Railway deploys each service after checks pass; `web` and `cms` redeploy only when their own folder changes.
- Until launch the site runs on Railway-generated links with `SITE_INDEXING=false`. All URLs come from environment variables, so moving to the real domain is a configuration change.
- Lighthouse CI checks mobile and desktop on every push; any category below 90 fails the build.
- Full runbook: [`docs/deployment.md`](docs/deployment.md)

---

## Branching and commits

- `main` is always deployable.
- [Conventional Commits](https://www.conventionalcommits.org): `feat(web): ...`, `fix(cms): ...`, `chore(infra): ...`, `docs: ...`
- Larger changes go through a pull request using the PR template.

---

## Security

- Secrets live only in Railway variables and local `.env` files.
- Forms are validated server-side and protected with Cloudflare Turnstile and rate limiting.
- Security headers (CSP, HSTS and others) are enforced by middleware.
- Payments are verified server-side; card data never touches our servers.

To report a vulnerability, email the project owner privately. Do not open a public issue. Details: [`docs/security.md`](docs/security.md)

---

## Documentation

| Document | Contents |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | Services, data flow, caching, payments |
| [`docs/data-sync.md`](docs/data-sync.md) | Local ⇄ live database and media workflow |
| [`docs/deployment.md`](docs/deployment.md) | Railway and Cloudflare setup |
| [`docs/creative-direction.md`](docs/creative-direction.md) | Concept, motion principles, menu |
| [`docs/security.md`](docs/security.md) | Threat model and controls |
| [`docs/content-guide.md`](docs/content-guide.md) | Editing content in Strapi |
| [`docs/go-live-checklist.md`](docs/go-live-checklist.md) | Launch steps |
| [`docs/PROGRESS.md`](docs/PROGRESS.md) | Build log |

---

## License

© The Wolverine Hub. All rights reserved. This repository is private and proprietary; no part may be copied, modified or distributed without written permission.
