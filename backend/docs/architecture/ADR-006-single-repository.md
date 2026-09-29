# ADR-006: One repository for backend, frontend and license server

**Status:** Accepted (owner, 2026-09-30) · **Supersedes:** "separate repositories; docs split per repo"
(owner decision recorded 2026-09-30 in `implementation-plan.md`, decisions row 4)

## Context
- Until 2026-09-30 the project lived in three repositories: `amohamedriyasdeen/school-os-fe`,
  `amohamedriyasdeen/school-os-be`, and a local-only `school-os-license-server` (design docs, no remote).
- The owner asked for **one remote repository with separate folders** for the frontend and backend, and for the
  license server to live in the same repository.
- The owner created `https://github.com/subashrs31/School-OS` and asked for a **new history**.

## Decision
1. One repository, `subashrs31/School-OS`, with three top-level folders:

   ```text
   School-OS/
   ├── backend/          ← former school-os-be (main @ 9e5ab2b)
   ├── frontend/         ← former school-os-fe (main @ 7038de8)
   ├── license-server/   ← former school-os-license-server (@ fa3829c)
   └── README.md
   ```
2. **Fresh history**: a single initial commit (`0e690b5`) containing the tracked files of each source at the commits
   above, exported with `git archive` (no `.env`, `node_modules` or `.git` copied).
3. Each folder stays an **independent project** with its own `package.json`, lockfile, `.env.example` and `docs/`.
   Commands run from inside the folder (`cd backend && npm run dev`).
4. Cross-cutting documents stay in `backend/docs/`; per-app documents stay in each folder's `docs/`. Links between
   them are relative.
5. The former repositories are no longer the place to work. Archiving them on GitHub is for their owner
   (`amohamedriyasdeen`) to do; they remain the only record of the pre-merge commit history.

## Alternatives considered
| Option | Why not |
|---|---|
| Keep three repositories | Owner wants one remote |
| Merge with history preserved (`git filter-repo --to-subdirectory-filter` + `--allow-unrelated-histories`) | Owner chose a new history |
| `git subtree add` | Keeps history but shows old files at the root in history; not needed with a fresh start |
| npm workspaces with one root lockfile now | Regenerating the lockfile can change resolved versions; deferred until there is a reason (shared packages or tooling) |
| Move cross-cutting docs to a root `docs/` | Extra churn now; can be done later without affecting code |

## Consequences
- **+** One pull request can change API, UI and license server together; one issue tracker.
- **+** One CI workflow (Phase 10) with path filters per folder; one root `docker-compose.yml` for local development.
- **−** `git log`/`blame` start at `0e690b5`; earlier authorship and history must be looked up in the archived
  repositories.
- **−** Branches that existed only in the old repositories (`arvi`, `mohan`, `riyas`, `dev`) were not carried over;
  unfinished work there must be copied over by hand. A `dev` branch in School-OS is a separate decision.
- **−** Each folder still needs its own `npm install`.
