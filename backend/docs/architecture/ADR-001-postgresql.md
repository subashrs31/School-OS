# ADR-001: Move the database from MySQL to PostgreSQL

**Status:** Accepted (owner, 2026-09-30) · **Date:** 2026-09-29

## Context
- The project mandate (master engineering prompt) requires MySQL → PostgreSQL.
- `SOS_DATABASE_DESIGN.md` relies on rules that are awkward or impossible in MySQL:
  - partial unique indexes ("one current academic year per school", "one default branch", "one active primary
    guardian", "one active class teacher per section");
  - composite pair foreign keys `(organization_id, id)` used as the isolation wall;
  - CHECK constraints (`pass_marks <= max_marks`, scope-type column rules on `user_has_roles`);
  - JSON change summaries in `audit_logs`, and planned monthly partitioning of `audit_logs`.
- The current MySQL schema is development-stage (two migrations, seed data only as far as the repositories show).
  Whether any environment holds real data is **UNKNOWN — REQUIRES CONFIRMATION**.

## Decision
Use **PostgreSQL 18** for all environments (local development and tests on the owner's local PostgreSQL 18.4 install,
databases `school_os` / `school_os_test`; staging and production when hosting is decided). Version changed from the
originally proposed 16 on 2026-09-30 to match the owner's installation.

**Update 2026-09-30 — implemented.** The owner has no MySQL for this project, so the backend was ported as-is to
PostgreSQL in one step (sub-phase 2.0-P, [change doc](../phases/2.0-port-mysql-to-postgres.md)); no data migration was
needed. MySQL-specific behaviour reproduced: case-insensitive email/uuid lookup at login and password reset
(`mode: 'insensitive'`); `SET FOREIGN_KEY_CHECKS` replaced by `TRUNCATE … CASCADE` in the seeder.

## Alternatives considered
| Option | Why not |
|---|---|
| Stay on MySQL 8 | No partial indexes (workarounds use generated columns), weaker CHECK/deferrable FK support, contradicts the mandate |
| MongoDB | Relational data with strict cross-table invariants; would discard the design doc |

## Consequences
- **+** Isolation and uniqueness rules enforced by the database, not only by code.
- **+** `jsonb`, native enums, `timestamptz`, declarative partitioning available.
- **−** All Sequelize models/migrations are replaced (see ADR-002); MySQL-specific behaviour (case-insensitive
  collation on `email`, `slug`) must be reproduced explicitly — use `citext` or lower-cased unique indexes.
- **−** Data migration required if any real MySQL data exists (Phase 2.9; skipped if confirmed none).
- Timestamps stored as `timestamptz` (UTC); school-local "today" computed with `organizations.timezone`.
