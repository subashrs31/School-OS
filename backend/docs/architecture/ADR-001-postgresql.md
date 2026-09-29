# ADR-001: Move the database from MySQL to PostgreSQL

**Status:** Proposed · **Date:** 2026-09-29

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
Use **PostgreSQL 16** for all environments (local via docker-compose, test, staging, production).

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
