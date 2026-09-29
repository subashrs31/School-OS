# school-os-fe documentation

| Document | Purpose |
|---|---|
| [current-state.md](current-state.md) | Frontend audit of `origin/dev@118e6ec`: routes, pages, API layer, auth handling, performance, FE-owned bugs |
| [target-architecture.md](target-architecture.md) | Proposed frontend architecture: redirect sign-in via the backend, feature folders, guards, testing |

Cross-cutting documents live in the backend repository **school-os-be** under `docs/`:

| Document | Purpose |
|---|---|
| `current-state.md` | Backend audit, APIs, database, authorization, security, backend bugs |
| `feature-audit.md` | ✅🟡🔴🔄 status of every module (backend and frontend columns) |
| `target-architecture.md` | System architecture |
| `implementation-plan.md` | Phases and sub-phases for all three repositories |
| `architecture/ADR-001…005` | Architecture decisions (PostgreSQL, Prisma, tenant scoping, testing, license server) |

License server documents live in **school-os-license-server** under `docs/`.
