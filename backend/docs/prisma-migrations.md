# Prisma migrations — rules for this project

> Owner-supplied rules (2026-09-30), applied to School OS. Binding for every schema change.
> `schema.prisma` describes what the database should look like; `prisma/migrations/` describes how to get there.

## Who runs what

| Action | Command | Run by |
|---|---|---|
| Create + apply a migration locally | `npm run db:migrate -- --name <meaningful_name>` (`prisma migrate dev`) | **Owner** |
| Create only (to add raw SQL before applying) | `npx prisma migrate dev --create-only --name <name>` | **Owner** |
| Apply migrations to the test DB | `npm run db:test:migrate` (`migrate deploy` against `TEST_DATABASE_URL`; refuses unless the DB name ends in `_test`) | **Owner** |
| Wipe + rebuild the test DB | `npm run db:test:reset` (`migrate reset --force` against `TEST_DATABASE_URL`, same guard) | **Owner**, only when intentional |
| Apply in CI / staging / production | `npm run db:migrate:deploy` (`prisma migrate deploy`) | Pipeline, after backup |
| Check status | `npm run db:migrate:status` | Anyone |
| Validate / format / generate client | `npm run prisma:validate`, `npx prisma format`, `npm run prisma:generate` | Anyone (not migrations) |

The AI assistant **never** runs `prisma migrate dev | deploy | reset` or `prisma db push` (CLAUDE.md §20). It edits
`schema.prisma`, reviews the generated `migration.sql`, and may edit a migration's SQL **only before it is applied**.
Recorded exceptions (each at the owner's explicit request):

| Date | Migration | What the assistant ran |
|---|---|---|
| 2026-09-30 | `20260929200833_init_port_from_mysql` | `migrate dev` (dev DB), `migrate deploy` (test DB) |
| 2026-09-30 | `20260930050955_identity_tenancy_foundation` | SQL generated with `migrate diff --from-config-datasource --to-schema` (after a no-drift check), hand-written backfill appended, applied with `migrate deploy` (dev) and `npm run db:test:migrate` (test) |

**Non-interactive shells** (the assistant's terminal, CI): `prisma migrate dev` refuses to run when it has warnings
to confirm. The equivalent is: check for drift → `npx prisma migrate diff --from-config-datasource --to-schema
prisma/schema.prisma --script` into a new `prisma/migrations/<UTC timestamp>_<name>/migration.sql` → review / append
SQL → `npx prisma migrate deploy`.

## Databases

| Environment | Database | Variable |
|---|---|---|
| Local development | `school_os` (PostgreSQL 18, localhost:5432) | `DATABASE_URL` |
| Local tests | `school_os_test` | `TEST_DATABASE_URL` (must end in `_test`, must differ from `DATABASE_URL`; tests refuse otherwise) |
| Staging / production | UNKNOWN — hosting not decided | set in the deployment's secret store |

Special characters in passwords must be URL-encoded in the URL (`@` → `%40`). `.env` is never committed.

## Rules

1. Commit `prisma/schema.prisma`, every `prisma/migrations/<timestamp>_<name>/migration.sql` and `migration_lock.toml`.
2. Name migrations for the change (`add_org_status`, not `update1`).
3. **Read the generated `migration.sql` before applying.** Look for data loss, type changes, and `NOT NULL` columns added
   to tables that already have rows.
4. Risky changes are **staged** across migrations: add nullable → backfill → make required.
5. **Never edit or delete a migration that has been applied anywhere.** Fix forward with a new migration.
6. `prisma db push` is not used in this project (it leaves no migration history).
7. No manual schema changes on any shared database (schema drift). Emergency SQL must be back-ported into
   `schema.prisma` and a migration straight away.
8. `prisma migrate reset` only against local or test databases, never production.
9. Seeds (`npm run seed:all`, configured as `migrations.seed` in `prisma.config.ts`) must not create real admin accounts or
   passwords outside local development. (Known issue: the current seed creates demo users with a shared demo password —
   local only, removed in Phase 4.)
10. CI applies the full migration history to an empty database, then runs the integration and API tests (Phase 10).
11. Rules Prisma cannot express (partial unique indexes, CHECK constraints) are added as raw SQL in a `--create-only`
    migration and covered by an integration test so a later migration cannot silently drop them.

## Adding a schema change (checklist)

```text
edit prisma/schema.prisma
→ npm run prisma:validate
→ owner: npm run db:migrate -- --name <name>
→ review prisma/migrations/<new>/migration.sql
→ owner: npm run db:test:migrate
→ npm test
→ commit schema + migration + code together
```
