# Data Sync — Local ↔ Live

_Stub — to be completed in Phase 4_

---

## Overview

Two independent environments: **local** (Docker Postgres + MinIO) and **live** (Railway Postgres + Bucket). Nothing is shared.

## What moves how

| What | How |
|---|---|
| Schema changes | Code (git push → Railway deploy) |
| Data migrations | `cms/database/migrations/` (run on boot) |
| Permissions and roles | Code in `cms/src/index.ts` bootstrap |
| Content + media | `strapi transfer` via npm scripts |
| Admin users / API tokens | Not transferred — create separately |

## Scripts

<!-- TODO: Document sync:push, sync:pull, backup:live, backup:local scripts once implemented in Phase 4 -->

## Rules

- **Before launch:** build content locally → `sync:push` to live
- **After launch:** live is source of truth; edit directly in live CMS admin; use `sync:pull` to refresh local
- `sync:push` disabled after `GO_LIVE_DATE` is set
