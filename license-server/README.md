# license-server

Identity and licensing service for School OS. It is the OpenID Connect provider every School OS client signs in
through, and the system of record for which schools (tenants) hold an active license.

**Status:** LS-0 scaffold done (Express + TypeScript ESM, `GET /health`, tests). Next: LS-1 (identity + OIDC).

```bash
npm install
npm run dev      # http://localhost:4000/health
npm test
```

Decision record:
[ADR-005](../backend/docs/architecture/ADR-005-license-server-oidc.md).

## Responsibilities

| Owns | Does not own |
|---|---|
| Identities: email/mobile, password hash, 2FA, lockout, status | Roles and permissions inside a school (backend) |
| Sign-in, sessions, refresh tokens, sign-out (OIDC) | School data: branches, staff, students, academics, exams |
| Tenants (one per school) and who may sign in to each | Invitations workflow (the backend calls this service to provision) |
| Plans, licenses (incl. the 7-day free trial), entitlements; blocking sign-in for unlicensed tenants | The public sign-up form (it lives in the frontend; this service does the account + trial part, ADR-007) |
| Hosted pages: login (email or mobile), 2FA, forgot/reset password, set password, parent mobile codes (later) | |
| Admin UI for platform staff: schools, plans, licences, suspensions, audit | |

## Planned stack

Node 24 · TypeScript (ESM) · Express 4 · `oidc-provider` 9.12.x · Prisma 7.10.x · PostgreSQL 18 (own database) ·
Vitest · Playwright (hosted pages).

## Documentation

| Document | Purpose |
|---|---|
| [docs/architecture.md](docs/architecture.md) | Components, OIDC configuration, keys, integration with the backend, deployment |
| [docs/data-model.md](docs/data-model.md) | Tables and columns |
| [docs/api.md](docs/api.md) | OIDC endpoints, admin API, webhook contract |
| [docs/phases/LS-1-identity-and-oidc.md](docs/phases/LS-1-identity-and-oidc.md) | First sub-phase specification |
| [docs/bdd/authentication.md](docs/bdd/authentication.md) · [docs/pict/authentication.txt](docs/pict/authentication.txt) | Behaviour scenarios and pairwise model |

Roadmap (phases LS-0…LS-6) lives in [backend/docs/implementation-plan.md](../backend/docs/implementation-plan.md)
together with the backend and frontend phases.
