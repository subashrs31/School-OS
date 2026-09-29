# ADR-002: Replace Sequelize with Prisma ORM

**Status:** Proposed · **Date:** 2026-09-29

## Context
- Current data access: Sequelize 6 models without FK declarations, associations in `src/models/index.ts`,
  migrations via sequelize-cli **plus** `sequelize.sync({ alter: true })` in `src/database/seeder.ts:17`, so the
  schema has two sources of truth.
- No transactions are used anywhere; query results are loosely typed (`Record<string, unknown>` / casts).
- The master prompt mandates Prisma.

## Decision
- Adopt **Prisma ORM 7.10.x** (`prisma` + `@prisma/client`, current stable; the npm `latest` tag on 2026-09-29 points
  to `8.0.0-rc.19`, a release candidate, which we do not adopt). Requires Node `^20.19 || ^22.12 || >=24` — dev
  machine has 24.12.
- `prisma/schema.prisma` is the single schema source; Prisma Migrate generates SQL migrations, which are reviewed and
  may be hand-edited to add partial indexes and CHECK constraints.
- One `PrismaClient` singleton in `src/lib/prisma.ts`.
- Migrate module by module (Phase 2 tables, then Phase 5 services). Sequelize and Prisma coexist only while the
  MySQL → Postgres cut-over is in progress; there is no dual-write period — services switch in whole modules.
- `sequelize`, `sequelize-cli`, `mysql2` are removed when the last module is migrated.

## Alternatives considered
| Option | Why not |
|---|---|
| Keep Sequelize on Postgres | Keeps weak typing and dual schema source; contradicts mandate |
| Drizzle ORM | Good SQL control, but mandate names Prisma; team has no Drizzle experience recorded |
| Knex / raw SQL | Loses generated types and migration tooling |

## Consequences
- **+** Generated types end most `any`/casts on the BE; `select` projections are type-checked.
- **+** `$transaction` for multi-write operations; typed error codes (`P2002`, `P2003`, `P2025`) map to 409/404.
- **−** Prisma cannot express partial unique indexes or CHECK constraints in schema — they live in migration SQL and
  must be covered by integration tests so a regenerated migration does not silently drop them.
- **−** Composite pair-FKs make relation fields more verbose (`@relation(fields: [organizationId, branchId], references: [organizationId, id])`).
- **Process:** per project rules, Prisma migration commands are **run manually by the project owner**; the
  assistant writes schema/migration files and provides the command.
