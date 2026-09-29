# School OS — Feature Audit (Phase 0)

> Snapshot: BE `origin/dev@e23badf`, FE `origin/dev@118e6ec`. Evidence in `current-state.md`.
>
> ✅ Implemented — works, preserve · 🟡 Partial — exists, needs completion · 🔴 Not implemented ·
> 🔄 Refactor required — works (or nearly) but must change (security, schema, Prisma migration, design doc)
>
> Because the target is PostgreSQL + Prisma and `SOS_DATABASE_DESIGN.md`, **every existing data-access path is also 🔄**
> for the ORM swap. The marks below describe the *behaviour*; the Prisma rewrite applies to all of them.

## Platform & cross-cutting

| Feature | BE | FE | Notes |
|---|---|---|---|
| Env validation | ✅ | ✅ | Joi schema in `appConfig.ts`; FE `.env.example` base URL wrong (B2) |
| DB connection | 🔄 | — | Sequelize/MySQL → Prisma/Postgres |
| Migrations | 🔄 | — | sequelize-cli + `sync({alter:true})` in seeder |
| Seeders | 🟡 | — | Roles/permissions/users only; weak default password |
| Error handling | 🔄 | 🟡 | Mongo leftovers in error map; raw 500 messages; FE has no error states |
| Logging | 🟡 | — | winston present; no request id; console.* in several files |
| Health/ready | 🟡 | — | `/api/health` static; no `/ready` |
| Swagger/OpenAPI | 🟡 | — | auth/users/IAM only; 0/41 school routes |
| Queue / events / cron | 🔴 | — | code exists, not wired; in-memory pending jobs |
| File upload | 🟡 | 🔴 | utility exists, unused by routes; denylist MIME check |
| Tests | 🔴 | 🔴 | none |
| CI/CD | 🔴 | 🔴 | none |

## Authentication

Target owner for credentials is the **license server** (ADR-005). "LS" = moves to `license-server`;
"remove" = deleted from the backend without replacement there.

| Feature | BE | FE | Target | Notes |
|---|---|---|---|---|
| Login (email/uuid + password) | 🔄 | ✅ | LS (hosted page) + BE BFF callback | works today; token lifetime bug (B5) |
| Refresh | 🔄 | 🟡 | LS rotating refresh tokens, held server-side by BE | stateless today; FE skips refresh on `/auth/me` (B4) |
| Logout | 🔄 | 🟡 | BE session end + LS end-session | BE no-op; header Sign Out has no handler |
| Me / session bootstrap | ✅ | 🟡 | BE `/auth/me` from profile + RBAC | FE permissions never refreshed after load |
| Register | 🔄 | 🔴 | replaced by **self-service school sign-up** (ADR-007, 5.16/6.18) + invitations; the user-level `/auth/register` is removed | no validator; uuid missing (B7) |
| Forgot / reset password | 🔄 | 🔴 | LS | plaintext token, enumeration, email never sent (B13) |
| OAuth (Google/Microsoft) | 🔄 | 🔴 | **remove** (owner: not required) | broken (`createTokens` missing, no routes) |
| CSRF | 🔴 | 🔴 | BE (BFF session) + FE header | middleware not mounted |
| Two-factor (design §4.1) | 🔴 | 🔴 | LS | |
| Mobile-code login for parents (design §4.1) | 🔴 | 🔴 | LS-8 (after LS-3, owner confirmed) | twilio/OTP helpers exist, unused |
| Licensing / subscription (design §9) | 🔴 | 🔴 | LS (LS-4), managed in the LS admin UI (LS-7); drives `organizations.status` via webhook; 7-day trial (ADR-007) | |

## Identity & access (design §4)

| Feature | BE | FE | Design table | Notes |
|---|---|---|---|---|
| Users CRUD, status toggle | ✅/🔄 | ✅ | `users` | JS filtering, default password, not org-scoped |
| User import (Excel) | 🔄 | 🔴 | `users` | N+1, no transaction, uuid bug |
| Roles CRUD | 🔄 | ✅ | `roles` | privilege escalation (primary roles) |
| Permissions CRUD | 🔄 | ✅ | `permissions` | slug `:` vs `.` (B8); design adds `module`, `is_sensitive`, `is_platform_only` |
| Role ↔ permission sync | 🔄 | ✅ | `role_has_permissions` | no transaction |
| User ↔ role assign/sync | 🔄 | 🟡 | `user_has_roles` | can grant super-admin; sync drops scopes (B10); FE single-role (B11); design adds branch scope, validity, grant/revoke audit |
| User ↔ permission exceptions | 🟡 | 🟡 | `user_has_permissions` | FE cannot set deny; design requires reason + expiry |
| Scoped authorization | 🔄 | 🔴 | — | org-scoped roles never grant (B6); no branch scope; no route guards in FE |
| Org membership | 🔄 | — | (replaced) | `user_organizations` never populated; design derives membership from role assignments + person records |
| Invitations | 🔴 | 🔴 | `invitations` | EXECUTION_ORDER Module 7 |
| Support sessions | 🔴 | 🔴 | `support_sessions` | |
| Audit log | 🔴 | 🔴 | `audit_logs` | |

## Tenancy (design §3)

| Feature | BE | FE | Design table | EXECUTION_ORDER |
|---|---|---|---|---|
| Organization list/create/get/update | 🟡🔄 | 🟡 | `organizations` | Module 1 — list not scoped to membership; edit broken (B1); counts 0 (B3); no status lifecycle, address block, branch mode |
| Organization status lifecycle | 🔴 | 🔴 | `organizations.status*` | Module 1 |
| Social links | 🔄 | 🟡 | `organization_social_links` | stored as JSON today |
| Branches CRUD | 🟡🔄 | 🟡 | `branches` | Module 2 — hard delete; no default branch; edit broken (B1); no delete UI |

## People (design §5)

| Feature | BE | FE | Design table | EXECUTION_ORDER |
|---|---|---|---|---|
| Designations | 🟡 | 🟡 | `designations` | Module 3 — inside staff service; no uniqueness |
| Departments | 🔴 | 🔴 | `departments` | Module 3 |
| Staff CRUD | 🟡🔄 | 🟡 | `staff` | Module 4 — `userId` required today (design: optional); single `branchId` (design: assignments); FK targets unchecked |
| Staff ↔ branch assignments | 🔴 | 🔴 | `staff_branch_assignments` | Module 4 |
| Guardians | 🔴 | 🔴 | `guardians` | Module 5 |
| Students CRUD | 🟡🔄 | 🟡 | `students` | Module 6 — single `name` (design: first/last), no `home_branch_id`, no `public_id` |
| Student ↔ guardian links | 🔴 | 🔴 | `student_guardians` | Module 6 |

## Academics (design §6–§7)

| Feature | BE | FE | Design table | EXECUTION_ORDER |
|---|---|---|---|---|
| Academic years | 🟡 | 🟡 | `academic_years` | Module 8 — `isCurrent` toggle non-transactional; no overlap check; no status |
| Grade levels | 🔴 | 🔴 | `grade_levels` | Module 9 |
| Classes | 🟡🔄 | 🟡 | `classes` | Module 10 — design: class = grade × branch × year |
| Sections | 🟡 | 🔴 | `sections` | Module 10 — no `organizationId`; no FE UI |
| Subjects | 🟡 | 🟡 | `subjects` | Module 11 |
| Class ↔ subject | 🟡 | 🔴 | `class_subjects` | Module 11 — service only, not routed |
| Enrollment | 🟡🔄 | 🔴 | `enrollments` | Module 13 — create only; replaces `student_academic_enrollments` |
| Teaching assignments | 🟡🔄 | 🔴 | `teaching_assignments` | Module 12 — two tables today; reassignment bug (B9) |

## Examination (design §8)

| Feature | BE | FE | Design table | EXECUTION_ORDER |
|---|---|---|---|---|
| Exams | 🟡 | 🟡 | `exams` | Module 14 — no status workflow; FE has no edit |
| Exam subjects | 🔴 | 🔴 | `exam_subjects` | Module 14 — included in list only, no CRUD |
| Marks entry | 🟡🔄 | 🔴 | `marks` | Module 15 — no enrollment link, no max-marks check, no entry status |
| Publish / corrections | 🔴 | 🔴 | `marks.is_published`, `mark_corrections` | Module 15 |

## Frontend-only

| Feature | Status | Notes |
|---|---|---|
| Routing + lazy pages | ✅ | |
| Route permission guards | 🔴 | |
| Sidebar | 🟡 | only Organizations gated; 8/11 links 404 (B12) |
| Dashboard | 🔴 | mock data |
| Header / user menu | 🔴 | hard-coded user, no sign-out handler |
| Org/branch context switcher | 🔴 | `team-switcher.tsx` unused |
| Theme customizer | 🟡 | mode tracked in three places; drawer mounted twice |
| Shared API types | 🔴 | ~102 `any` |

## Later (design §9, not in current scope)

Plans, plan features, organization subscriptions, entitlements, settings, outbox events, files,
student sensitive profiles — all 🔴 by design.
