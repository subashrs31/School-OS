# School OS — Current State Report (Phase 0)

> Snapshot of **`origin/dev`**: backend `school-os-be@e23badf` ("School COnfig", 2026-09-28), frontend
> `school-os-fe@118e6ec` ("School Config", 2026-09-28). Gathered read-only with `git show`; nothing was run.
> Those two repositories (and the license-server design) were merged into this single School-OS repository on
> 2026-09-30 as `backend/`, `frontend/` and `license-server/` (ADR-006). The audit describes the code as it was then.
>
> Tags: **[F]** fact read from code · **[H]** hypothesis/inference not executed ·
> **UNKNOWN — REQUIRES CONFIRMATION** cannot be determined from the repositories.
> Paths are relative to the folder named in each section (BE = `backend/`, FE = `frontend/`).

---

## 1. Current Architecture

```mermaid
flowchart LR
  subgraph FE[frontend — React SPA]
    P[Pages] --> H[TanStack Query hooks]
    H --> S[services/*-service.ts]
    S --> AX[axios-instance<br/>withCredentials]
    P --> RX[Redux: auth, customizer]
  end
  AX -->|HTTPS JSON + HttpOnly cookies| API
  subgraph BE[backend — Express monolith]
    API[/api routes/] --> MW[authCheck → authorize(resource.action)]
    MW --> C[controllers] --> SV[services]
    SV --> M[Sequelize models]
  end
  M --> DB[(MySQL)]
  SV -. emitter/queue (not wired) .-> Q[jobs / failed_jobs tables]
```

- [F] Two repositories at the time of the audit (now folders of one repository, ADR-006): a Vite React SPA and an
  Express 4 REST API. Single process, layered
  `routes → controllers → services → models`. No module folders; layers are grouped by type.
- [F] The FE never touches the DB. All data flows through `/api`.
- [F] Background pieces exist (`src/queue`, `src/events`, `src/schedule`) but are disabled in
  `src/config/bootstrap.ts` (register/listeners/scheduler lines are commented out).

## 2. Current Technology Stack

Frontend stack: see [frontend/docs/current-state.md](../../frontend/docs/current-state.md) §1 (React 19.3, Vite 8.3, TypeScript 6.0, Tailwind 4.3,
Redux Toolkit 2.12, TanStack Query 5.104, axios 1.20, react-router 7.18).

| Layer | Technology (locked version) |
|---|---|
| BE runtime | Node (dev machine 24.12), Express 4.22.3, TypeScript 5.9.3, ts-node 10.9.2 (`transpileOnly`) |
| BE data | Sequelize 6.37.8, mysql2 3.24.4, sequelize-cli 6.6.5 |
| BE auth | jsonwebtoken 9.0.3, passport 0.7 (+google-oauth20, facebook), bcryptjs 2.4.3 |
| BE other | Joi 17.13, winston 3.19, morgan, multer 2.3, nodemailer 8.0, node-cron 4.6, AWS S3 SDK, twilio, swagger-jsdoc/ui |
| Database | MySQL (server version **UNKNOWN — REQUIRES CONFIRMATION**) |

## 3. Current Modules

| Module | BE | FE |
|---|---|---|
| Auth | login, refresh, logout, me, register, forgot/reset password | login page only |
| IAM (users, roles, permissions, assignments) | full CRUD + sync endpoints | IAM tabs + role/user permission editors |
| Organizations | list/get/create/update/summary | list, create, details, edit |
| Branches | CRUD (hard delete) | list + create/edit dialogs |
| Staff + designations | list/get/create/update | list + dialogs |
| Students + enrollment | list/get/create/update, enroll | list + dialogs (no enroll UI) |
| Academics (years, classes, sections, subjects, class-subjects, teacher assignments, exams, marks) | partial (see feature-audit.md) | one tabbed page (years, classes, subjects, exams) |
| Dashboard | — | mock data only |

## 4. Current APIs

All under `/api` (`src/app.ts`). `authCheck` applies to everything registered after `/auth`
(`src/routes/index.ts`). Permission checks are `authorize('<action>')` resolving to `<resource>.<action>`.

| Area | Endpoints | Guard |
|---|---|---|
| Health | `GET /api/`, `GET /api/health` (static, no DB check) | public |
| Auth | `POST login, refresh, logout, forgot-password, reset-password/:token, register`; `GET verify-reset-token/:token, me` | public / authCheck for logout, me |
| Users | `GET/POST /users`, `GET/PUT/DELETE /users/:id`, `POST /users/status-change/:id`, `PUT /users/profile`, `POST /users/change-password`, `POST /users/validate-import`, `POST /users/import` | `users.*` |
| IAM | `/iam/roles` CRUD + `/assignable`; `/iam/permissions` CRUD + `/actions`; `/iam/roles/:roleId/permissions[/sync|/:permissionId]`; `/iam/users/:userId/roles[/sync|/:roleId]`; `/iam/users/:userId/permissions[/sync|/:permissionId]` | `roles.*`, `permissions.*`, `user-role.*`, `user-permission.*` |
| Organizations | `GET/POST /organizations`, `GET/PATCH /organizations/:organizationId` | `organizations.*` + `assertAccess` |
| Branches | `/organizations/:organizationId/branches` GET/POST, `/:branchId` GET/PATCH/DELETE | `branches.*` |
| Staff | `/…/staff` GET/POST, `/:staffId` GET/PATCH, `/staff/designations` GET/POST, `/designations/:id` PATCH | `staff.*` |
| Students | `/…/students` GET/POST, `/:studentId` GET/PATCH, `POST /students/enroll` | `students.*` |
| Academics | `/…/academics/years`, `/classes`, `/classes/:classId/sections`, `/subjects`, `/assignments/class-teachers`, `/assignments/subject-teachers`, `/exams`, `/marks` (GET/POST, PATCH by id where present) | `academics.*` |

- [F] Swagger (`src/config/swagger.ts`) annotates auth/users/IAM only; **0 of 41** school-domain routes are annotated.
- [F] No pagination, filtering or sorting parameters on any list endpoint.
- [F] No DELETE for organizations, staff, students or any academic entity. Class-subject service methods exist
  (`src/services/academic.service.ts:78-89`) but are not routed.

## 5. Current Database Schema

- [F] Two migrations: `src/database/migrations/20250101000000-create-initial-tables.js` (users, RBAC, OAuth,
  notifications, jobs, failed_jobs) and `20250102000000-create-organization-tables.js` (17 school tables).
- [F] School tables: `organizations`, `branches`, `user_organizations`, `designations`, `staff`, `students`,
  `student_academic_enrollments`, `academic_years`, `classes`, `sections`, `subjects`, `class_subjects`,
  `class_teacher_assignments`, `subject_teacher_assignments`, `exams`, `exam_subjects`, `marks`.
- [F] Integer auto-increment PKs. FKs exist in migrations only (models declare none). `organizationId` → CASCADE.
- [F] Organization stores `address` TEXT, `socialLinks` JSON, `schoolTiming` string, `isActive` boolean — none of the
  design doc's status lifecycle, address block or branch mode.
- [F] `sections` has no `organizationId`; `user_organizations(userId, organizationId)` is not unique;
  `subject_teacher_assignments` has no unique constraint.
- [F] Unique indexes on nullable columns (`class_teacher_assignments.sectionId`, `class_subjects.academicYearId`) do not
  prevent duplicates when NULL.
- [F] Soft delete only on `users.deletedAt`, handled manually; branch delete is a hard `destroy()`.
- [F] `src/database/seeder.ts:17` runs `sequelize.sync({ alter: true })` on every seed/truncate, which can rewrite the
  migration-created schema. [H] Can create duplicate indexes and drop the migration's password default.
- Existing data volume / whether any non-development database holds real data: **UNKNOWN — REQUIRES CONFIRMATION**.

Gap vs `SOS_DATABASE_DESIGN.md` (source of truth): missing `organization_social_links`, `invitations`,
`support_sessions`, `audit_logs`, `departments`, `staff_branch_assignments`, `guardians`, `student_guardians`,
`grade_levels`, `enrollments` (replaces `student_academic_enrollments`), `teaching_assignments` (replaces the two
assignment tables), `mark_corrections`; most existing tables need new columns (status enums, AUDIT, VERSION,
ADDRESS, `public_id`).

## 6. Current ORM

- [F] Sequelize 6 with one shared instance (`src/config/sequelize.ts`, pool max 10). `connectDB()` authenticates at
  startup (`src/config/db.ts`).
- [F] Associations in `src/models/index.ts`. Services call models directly (no repository layer).
- [F] **No transactions anywhere** (grep). Multi-write operations run unguarded: role/permission sync
  (destroy → bulkCreate), user delete, user import, class-teacher reassignment, `isCurrent` year toggle.
- [F] Query anti-patterns: `userService.getUsers` fetches all users then filters by role in JS; `importUsers` does
  about 5 queries per row; `studentService.list(branchId)` does two queries + JS de-dup.

## 7. Current UI

Moved to the frontend docs: [frontend/docs/current-state.md](../../frontend/docs/current-state.md) §2–§9 (routes, pages, hooks, auth handling,
permission-driven UI, performance, technical debt).

## 8. Current Authentication

- [F] Login by email **or uuid** + bcrypt password (`src/services/auth.service.ts:24-35`).
- [F] Default `AUTH_BASE=cookie`: HttpOnly `accessToken`/`refreshToken` cookies; `secure` + `SameSite=None` outside
  local (`src/helpers/cookies.ts`). (FE-side session handling: [frontend/docs/current-state.md](../../frontend/docs/current-state.md) §6.)
- [F] **Token lifetime bug**: expiry is converted to milliseconds and passed as `expiresIn`, which jsonwebtoken reads
  as seconds → access ≈ 13.9 days, refresh ≈ 19 years. Cookie `maxAge` (ms) is correct, which limits cookie mode.
- [F] Refresh is stateless (jti discarded), no rotation or revocation; `logoutUser` is empty.
- [F] `authCheck` does not check that the user is still active/not deleted.
- [F] Reset token stored **plaintext** in `resetTokenHash`; forgot-password returns 404 for unknown email (account enumeration).
- [F] Password reset/welcome emails are never sent (listeners not registered in `bootstrap.ts`).
- [F] OAuth broken: `oauth.service.ts:36` calls non-existent `authService.createTokens`; no OAuth routes;
  `passport-microsoft` referenced but not installed.
- [F] `User.create` without `uuid` (register, OAuth, import) — `uuid` is `allowNull:false` with no default.
  [H] Those flows throw a validation error.

## 9. Current Authorization

- [F] RBAC: roles (`roleType` primary/secondary/normal), permissions (`resource`+`action`), role↔permission,
  user↔role (`scopeType` global/organization, `scopeId`), user↔permission (allow/deny).
- [F] `can()` (`src/services/authorization.service.ts:130-172`): primary role → allow; direct deny wins; then direct
  allow; then role permission. Up to 4 queries per request + 1 in `authCheck`.
- [F] **Org-scoped roles never grant**: `authorize` calls `can(userId, slug)` without a scope
  (`src/middleware/authorize.middleware.ts:38`), so only `{scopeType:'global'}` rows are considered.
- [F] Org membership comes from `user_organizations`, but **no code creates those rows**. Controllers bypass membership
  for primary/secondary roles (`isGlobal`). [H] Only super-admin can use school modules today.
- [F] **Privilege escalation**: holders of `roles.create/edit` can create a `primary` role
  (`src/services/role.service.ts:27-48`); holders of `user-role.create` can assign any role, including super-admin,
  to anyone including themselves (`src/services/userRole.service.ts:45-50`).
- [F] **Mass assignment**: school-module services pass unvalidated `req.body` into `.update()` (e.g.
  `branch.service.ts:28`, `academic.service.ts:23,41,57,73,148`, `staff.service.ts:40,56`,
  `student.service.ts:53`, `organization.service.ts:40,42`). [H] A body with `organizationId` moves the record.
- [F] Custom permissions are created with slug `resource:action` (`permission.service.ts:32`) but checked as
  `resource.action` → they can never match.
- [F] Seeded: roles `super-admin`, `admin`, `school-admin`, `branch-admin`, `teacher`, `accountant`, `hr`;
  88 permissions (11 resources × 8 actions). Only `admin` has mappings (IAM/users). `viewer` referenced in code but not seeded.
- [F] Branch-level scoping is not implemented (`UserOrganization.branchId` is never enforced).

## 10. Current Testing

- [F] **None.** No test files, runners, coverage or E2E tooling in either repo.

## 11. Current Deployment

- [F] No Dockerfile, docker-compose, deploy scripts or infrastructure code.
- Owner (2026-09-30): the app is **not deployed anywhere**; `dev` runs locally only. Future hosting target:
  **UNKNOWN — REQUIRES CONFIRMATION**.

## 12. Current CI/CD

- [F] None (no `.github/workflows`, no husky/lint-staged/prettier). FE has `eslint`; BE has no linter.
- [H] `npm run build` in BE likely fails: `noUnusedLocals` + unused `SAFE_ATTRS` (`auth.service.ts:12`) and the
  missing `createTokens`. Dev works because ts-node is `transpileOnly`.

## 13. Current Security

| Control | State |
|---|---|
| Security headers (helmet) | [F] absent |
| CORS | [F] allowlist outside local; `origin:true` (reflect any) when `NODE_ENV=local`; requests without Origin allowed |
| Rate limiting | [F] global 100/15 min and auth 10/15 min mounted; reset/OTP limiters defined but unused; all no-op in local |
| CSRF | [F] middleware exists, **never mounted**; FE never sends `X-XSRF-TOKEN` |
| Passwords | [F] bcrypt 10 rounds; default `'12345678'` (`src/models/user.model.ts:53`); `resetPasswords.ts` resets everyone to it |
| Input validation | [F] Joi only for auth + users; none for IAM bodies or any school module |
| Uploads | [F] MIME denylist from client header, no magic-byte check; `/uploads` served without auth |
| Errors | [F] no stack traces returned, but raw `err.message` returned for 500s; error map has Mongo leftovers |
| Secrets | [F] no committed `.env`; `.env.example` only |
| OTP | [F] OTP logged in plaintext (`src/helpers/verification.ts:27`) |

## 14. Current Performance

- [F] No measurements, budgets or metrics exist. Baseline: **UNKNOWN — REQUIRES CONFIRMATION** (to be measured).
- [F] BE: 5+ queries per authorized request; JS-side filtering; N+1 import; no pagination.
- FE performance: [frontend/docs/current-state.md](../../frontend/docs/current-state.md) §8.

## 15. Observability

- [F] winston console + daily-rotated files (15 days), plain text, no request context; morgan access log.
- [F] No request IDs, no metrics, no `/ready`. `/api/health` does not check the DB.
- [F] Queue, scheduler and listeners use `console.*` instead of the logger.

## 16. Technical Debt

1. No tests, no CI, no lint in BE, FE `strict` off.
2. Layer-by-type layout; every service touches models directly; no transactions.
3. Tenant isolation relies on each service remembering `organizationId`; several do not (see §9).
4. Two naming conventions for permission slugs; unused seeded permissions (`role-permission.*`).
5. `sequelize.sync({ alter: true })` alongside migrations.
6. Queue keeps pending jobs in memory only; lost on restart.
7. README is boilerplate text; no project documentation before this Phase 0 set.
8. FE technical debt: [frontend/docs/current-state.md](../../frontend/docs/current-state.md) §9.

## 17. Known Bugs (confirmed in code; not yet reproduced at runtime)

Frontend-owned bugs **B1–B4, B11, B12** (PUT vs PATCH, env base URL, summary counts, `/auth/me` redirect loop,
single-role save, dead sidebar links) are documented in [frontend/docs/current-state.md](../../frontend/docs/current-state.md) §10. The backend side of
B1 is that school-module update routes are PATCH (`src/routes/branch.routes.ts:11` etc.); of B3, that the controller
returns `{ organization, summary }` (`src/controllers/organization.controller.ts:25`).

| # | Bug | Evidence |
|---|---|---|
| B5 | JWT expiry units (ms vs s) | BE `src/config/appConfig.ts`, `src/helpers/token.ts` |
| B6 | Org-scoped roles never grant | BE `authorize.middleware.ts:38`, `authorization.service.ts:12-15` |
| B7 | User creation without uuid in register/OAuth/import | BE `user.model.ts:50`, `auth.service.ts:42`, `oauth.service.ts:23`, `user.service.ts:147` |
| B8 | Custom permission slug `:` vs `.` | BE `permission.service.ts:32`, `authorize.middleware.ts:35` |
| B9 | Class-teacher reassignment hits unique index after deactivation | BE `academic.service.ts:106-109`, migration `cta_class_section_year_unique` |
| B10 | User role sync wipes org-scoped assignments and re-adds as global | BE `userRole.service.ts:66-75` |
| B13 | Password reset/welcome emails never sent | BE `src/config/bootstrap.ts` |

## 18. Missing Features (relative to SOS_DATABASE_DESIGN.md and EXECUTION_ORDER.md)

Organization status lifecycle, social links table, departments, staff↔branch assignments, guardians and
student↔guardian links, invitations, support sessions, audit log, grade levels, enrollments model, unified teaching
assignments, exam-subject CRUD, marks publication and corrections, branch-scoped access, subscription (later), and every
FE screen beyond the current org/IAM pages. Details: `feature-audit.md`.

## 19. Open Questions

**Answered by the owner (2026-09-30)**
- `dev` is **not deployed anywhere**; it runs locally only. (Answers "where is it deployed today".)
- Google/Microsoft sign-in is **not required**; OAuth code will be removed rather than fixed.
- Authentication moves to a **separate custom license server** (identity + licenses, OIDC) — see ADR-005.
- ~~Frontend, backend and license server are **separate repositories**.~~ **Superseded 2026-09-30:** all three now
  live in one repository with folders `backend/`, `frontend/`, `license-server/` (ADR-006).

**Still UNKNOWN — REQUIRES CONFIRMATION**
1. Does any shared MySQL database hold data that must be kept? (Likely not, given the above.)
2. MySQL server version in use (only relevant if data must be migrated).
3. Login identifier in the license server: email/mobile only, or also the current uuid-style codes (`DNSTSA0001`)?
4. Target hosting for the future deployment.
5. Target browsers/devices for the E2E matrix.
