# Security — The Wolverine Hub

_Stub — to be completed in Phase 5 and Phase 11_

---

## Threat model

<!-- TODO: Document threat model, trust boundaries, attack surface -->

## Controls

| Layer | Control |
|---|---|
| Headers | Strict CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP |
| Forms | Astro Actions + Zod + Turnstile (server-verified) + honeypot + rate-limit |
| Output | Strapi rich text via Blocks renderer only; no `set:html` with unsanitised content |
| Secrets | Railway variables + local `.env`; gitleaks in CI and pre-commit |
| Dependencies | Lockfiles committed; `npm audit --audit-level=high`; Dependabot; CodeQL |
| Cookies | `Secure; HttpOnly; SameSite=Lax`; no tokens in `localStorage` |
| Uploads | Authenticated Strapi admin only; MIME/size checks; SVG sanitised |
| Payments | Server-side hash verification; amount read from DB not client; no card data stored |

## Reporting vulnerabilities

Email the project owner privately. Do not open a public issue.

## Security scan targets

- securityheaders.com — target A+
- Mozilla Observatory — target A+
