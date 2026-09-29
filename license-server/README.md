# school-os-license-server

Identity and licensing service for School OS. It is the OpenID Connect provider every School OS client signs in
through, and the system of record for which schools (tenants) hold an active license.

**Status:** design only — no code yet. Decision record: `school-os-be/docs/architecture/ADR-005-license-server-oidc.md`.

## Responsibilities

| Owns | Does not own |
|---|---|
| Identities: email/mobile, password hash, 2FA, lockout, status | Roles and permissions inside a school (school-os-be) |
| Sign-in, sessions, refresh tokens, sign-out (OIDC) | School data: branches, staff, students, academics, exams |
| Tenants (one per school) and who may sign in to each | Invitations workflow (school-os-be calls this service to provision) |
| Plans, licenses, entitlements; blocking sign-in for unlicensed tenants | |
| Hosted pages: login, 2FA, forgot/reset password, set password | |

## Planned stack

Node 24 · TypeScript (ESM) · Express 4 · `oidc-provider` 9.12.x · Prisma 7.10.x · PostgreSQL 16 (own database) ·
Vitest · Playwright (hosted pages).

## Documentation

| Document | Purpose |
|---|---|
| [docs/architecture.md](docs/architecture.md) | Components, OIDC configuration, keys, integration with school-os-be, deployment |
| [docs/data-model.md](docs/data-model.md) | Tables and columns |
| [docs/api.md](docs/api.md) | OIDC endpoints, admin API, webhook contract |
| [docs/phases/LS-1-identity-and-oidc.md](docs/phases/LS-1-identity-and-oidc.md) | First sub-phase specification |
| [docs/bdd/authentication.md](docs/bdd/authentication.md) · [docs/pict/authentication.txt](docs/pict/authentication.txt) | Behaviour scenarios and pairwise model |

Roadmap (phases LS-0…LS-6) lives in `school-os-be/docs/implementation-plan.md` together with the other repositories.
