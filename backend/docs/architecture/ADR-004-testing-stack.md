# ADR-004: Testing stack

**Status:** Accepted (owner, 2026-09-30) · **Date:** 2026-09-29

## Context
Neither repository has any tests, test runner or CI (`current-state.md` §10, §12). The mandate requires TDD, BDD,
PICT, unit, integration, API and Playwright E2E testing. The FE already builds with Vite.

## Decision
| Layer | Tool (version on npm 2026-09-29) | Repo |
|---|---|---|
| Unit + integration | **Vitest 5.0.x** | BE and FE |
| API | **Supertest 7.3.x** on the Express `app` (no network port) | BE |
| Component | **@testing-library/react 16.3.x** + jsdom | FE |
| E2E + BDD | **@playwright/test 1.63.x** + **playwright-bdd 9.2.x** (Gherkin `.feature` → Playwright tests) | new `frontend/e2e/` folder |
| Pairwise | **Microsoft PICT** CLI (not an npm dependency); models in `docs/pict/*.txt`, generated tables committed next to them | docs |
| Test DB | Local PostgreSQL 18 database `school_os_test`, separate `TEST_DATABASE_URL` | BE |

All are **devDependencies**; each is added in the sub-phase that first needs it, with approval.

## Rules
- The test database URL must differ from `DATABASE_URL`; the test setup refuses to run otherwise.
- Schema is applied to the test DB with `npm run db:test:migrate` (`prisma migrate deploy` against
  `TEST_DATABASE_URL`, refuses unless the DB name ends in `_test`). The project owner runs it; the assistant does not
  execute Prisma migration commands (see [prisma-migrations.md](../prisma-migrations.md)). Tests empty the tables
  themselves (`TRUNCATE … CASCADE`) instead of resetting the schema.
- **Implemented 2026-09-30 (2.0-P):** Vitest 5.0.2 + Supertest 7.3.0 in `backend/`; `test/guard.ts` refuses to run
  against a non-test database; `test/unit`, `test/integration`, `test/api`.
- Fixtures are created through services or the API, never through the UI (except in tests that verify that UI).
- Playwright: Chromium on every PR; Firefox, WebKit and one mobile viewport nightly.
- Every bug fix adds a regression test that fails before the fix.

## Alternatives considered
| Option | Why not |
|---|---|
| Jest | Needs extra TS/ESM transform setup; Vitest matches Vite on FE and one runner covers both repos |
| Cucumber.js + Playwright | Separate runner and reporting; playwright-bdd keeps Playwright's fixtures, tracing and parallelism |
| Cypress | Mandate names Playwright |

## Consequences
- **+** One runner and assertion API across BE and FE; Gherkin scenarios in `docs/bdd` map directly to `.feature` files.
- **−** Integration tests need Docker locally and a Postgres service in CI.
- **−** Vitest 5 is a new major; if a plugin incompatibility appears, pin to the previous major and record it here.
