# school-os-be documentation

This repository holds the **cross-cutting** architecture documents for School OS and the backend-specific ones.

| Document | Purpose |
|---|---|
| [current-state.md](current-state.md) | Backend audit of `origin/dev@e23badf`: stack, APIs, database, ORM, auth, authorization, security, known bugs |
| [feature-audit.md](feature-audit.md) | ✅🟡🔴🔄 status of every module, backend and frontend columns, mapped to EXECUTION_ORDER modules and design tables |
| [target-architecture.md](target-architecture.md) | Proposed system and backend architecture |
| [implementation-plan.md](implementation-plan.md) | Phases and sub-phases for all three repositories, owner decisions |
| [architecture/](architecture/) | ADR-001 PostgreSQL · ADR-002 Prisma · ADR-003 tenant scoping & RBAC · ADR-004 testing stack · ADR-005 license server (OIDC) |
| [phases/2.1-prisma-foundation.md](phases/2.1-prisma-foundation.md) | First backend sub-phase specification |
| [bdd/](bdd/) · [pict/](pict/) | Behaviour scenarios and pairwise models for backend sub-phases |

Other repositories:

| Repository | Docs |
|---|---|
| **school-os-fe** | `docs/current-state.md` (frontend audit, FE-owned bugs B1–B4, B11, B12), `docs/target-architecture.md` |
| **school-os-license-server** | `docs/architecture.md`, `docs/data-model.md`, `docs/api.md`, `docs/phases/LS-1-identity-and-oidc.md`, BDD and PICT |

Schema source of truth: `SOS_DATABASE_DESIGN.md` (owner-supplied). Module order: `EXECUTION_ORDER.md` (owner-supplied),
rebased onto Prisma in `implementation-plan.md`. §4.1 `users` and §9 subscription tables are split between this
repository and the license server as described in ADR-005.
