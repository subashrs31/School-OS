# frontend — Current State Report (Phase 0)

> Snapshot of **`origin/dev@118e6ec`** ("School Config", 2026-09-28) of the former `school-os-fe` repository,
> read-only via `git show`; nothing was run. Backend compared at `school-os-be@origin/dev e23badf`.
> Both repositories were merged into this single School-OS repository on 2026-09-30 (ADR-006); paths below are
> relative to `frontend/`.
> Tags: **[F]** fact from code · **[H]** hypothesis not executed · **UNKNOWN — REQUIRES CONFIRMATION**.
> Cross-cutting state (APIs, database, authorization, security, known BE bugs) lives in
> [backend/docs/current-state.md](../../backend/docs/current-state.md). Bug IDs (B1…B13) are shared between both documents.

## 1. Stack

| Area | Package (locked version) |
|---|---|
| UI | react / react-dom 19.3.0 |
| Build | vite 8.3.1, @vitejs/plugin-react 6.1.1, TypeScript 6.0.3 (**`strict` not enabled** in `tsconfig.app.json`) |
| Styling | tailwindcss 4.3.3 (via @tailwindcss/vite), shadcn 4.21 style `base-nova` on @base-ui/react 1.8.0, lucide |
| State | @reduxjs/toolkit 2.12.0 + react-redux 9.3.0 (auth, customizer); @tanstack/react-query 5.104.0 |
| Tables / charts | @tanstack/react-table 9.2.4, recharts 3.8.0 |
| HTTP | axios 1.20.0 |
| Routing | react-router-dom 7.18.4 |
| Lint | eslint 10.11 (`js.recommended`, `tseslint.recommended` — not type-checked, react-hooks, react-refresh) |
| Tests | **none** (no runner, no files, no Playwright) |
| CI | **none** |

## 2. Routing (`src/routes`)

- [F] `routeConfig.ts:6` sets `routerType = "browser"` → `createBrowserRouter(routes, { basename: BASE_URL })`
  (`router.tsx:134-137`). A hash router remains selectable.
- [F] Public (inside `PublicRouter`): `/auth/login`; `/auth/register` lazy-loads the **login** page (`router.tsx:29`).
- [F] Protected (inside `PrivateRouter`, all route-level `lazy()`): `/dashboard`, `/iam`, `/iam/roles/:id/permissions`,
  `/iam/users/:id/permissions`, `/organization`, `/organization/create`, `/organization/:organizationId`
  `[/edit|/branches|/staff|/students|/academics]`.
- [F] `/` → `RootRedirect` (cookie check only); `/404`, `/403`, `/500` eager `ErrorPage`; `*` → `/404`.
- [F] **No role/permission route guards.** `/403` is never navigated to. Any signed-in user can open `/iam` by URL;
  only the backend blocks the calls.
- [F] No `errorElement` on any route. Several route paths are hard-coded strings instead of `PATHS`.

## 3. Pages

All org pages use `OrgPageShell`. No page checks `isError`/`error` (grep: 0); failures appear only as axios toasts and
failed queries render the empty state.

| Page | Data | C / U / D | Status |
|---|---|---|---|
| `organization/organization-list` | real; client-side search | create gated; edit button not gated; no delete | ✅ |
| `organization/organization-create` | real | create; only `name` validated | ✅ |
| `organization/organization-details` | real | edit gated; summary counts always 0 (**B3**) | 🟡 |
| `organization/organization-edit` | real | update **fails** (PUT vs PATCH, **B1**); no permission check | 🟡 broken |
| `organization/branch/branch-list` | real | create ✅; edit fails (**B1**); no delete UI though hook + API exist | 🟡 |
| `organization/staff/staff-list` | real; fetches global `/users` for the picker | create ✅; edits fail (**B1**); cannot clear optional fields | 🟡 |
| `organization/students/student-list` | real; client-side search | create ✅; edit fails (**B1**), sends empty strings; no enroll UI | 🟡 |
| `organization/academics/academics-page` | real | create years/classes/subjects/exams; edits fail (**B1**); no exam edit; no sections/assignments/marks UI | 🟡 |
| `system/iam` (Users, Roles, Permissions tabs) | real; client-side search | full CRUD; **no permission gating** | ✅ |
| `system/iam/role-permissions` | real; fetches all roles to `.find()` one | sync | ✅ |
| `system/iam/user-permissions` | real; fetches all users to `.find()` one | saves one role and drops others; cannot set `deny` (**B11**) | 🟡 |
| `auth/login` | real | login only; "Forgot password"/"Sign up" are `href="#"` | ✅ (to be replaced, see target) |
| `dashboard` | **mock** (`./data.json`, hard-coded stats/charts, fake `setTimeout` actions) | — | 🔴 |
| `error` | static | — | ✅ |

Header (`site-header.tsx`) is mock: hard-coded "Admin User"/"Super Admin", "2025-2026 Year", Sign Out without handler.

## 4. API layer

- [F] Endpoints in `src/services/api-constants.ts`, relative paths resolved against `VITE_REACT_CLIENT_URL`.
- [F] `apiUpdate` always sends **PUT** (`axios-instance.ts:120-121`); BE school-module updates are **PATCH** → **B1**.
  IAM/user updates are PUT on the BE and work.
- [F] `.env.example:1` = `http://localhost:5000/`; BE mounts under `/api` → **B2**. Variable name is misleading for an API base.
- [F] UI shows permission slug preview as `resource:action` (`PermissionsTab.tsx:151`), mirroring BE bug **B8**.
- [F] FE never sends `X-XSRF-TOKEN`; enabling BE CSRF would 403 every mutation today.

## 5. Hooks and caching

- [F] `ORG_KEYS` prefix design means `invalidateQueries(ORG_KEYS.all)` refetches every org-scoped query
  (`useOrganization.ts:44,54`); the extra `detail` invalidation is redundant.
- [F] Unused hooks: `useDeleteBranch`, `useEnrollStudent`, `useMarks`, `useUpsertMark`, `useMe`, `useRefreshToken`.
- [F] `extract()` fallback chain (`useOrganization.ts:20`) can treat a whole object as a list if the response shape changes.
- [F] Name clash: `usePermissions` in `hooks/iam/useIam.ts:53` vs `hooks/auth/usePermissions.ts:18`.
- [F] No server-side pagination or search anywhere; client-side filtering in org list, students, users, staff picker.

## 6. Auth handling (current — to be replaced by the BFF redirect, see target)

- [F] FE sets its own readable `isLoggedIn=true` cookie on login (`utils/auth-session.ts:28-30`, 7 days); route guards
  trust only this cookie. Real tokens are BE HttpOnly cookies.
- [F] Axios: `withCredentials`; 401 → single-flight refresh + retry (`axios-instance.ts:79-101`); proactive refresh every
  10 min (`hooks/auth/useTokenRefresh.ts`).
- [F]/[H] **B4:** `/auth/me` uses `skipAuthRedirect`, so a 401 there never refreshes; `clearAuth()` does not clear the
  `isLoggedIn` cookie → `PrivateRouter` → login → `PublicRouter` sees cookie → dashboard → loop.
- [F] Permissions loaded once from `/auth/me` and never refreshed without reload (disabled query ignores invalidation).
- [F] Login failure shows two toasts (interceptor + `login-form.tsx:20-23` using `react-hot-toast`).

## 7. Permission-driven UI

- [F] Permissions from Redux `auth.permissions {all, items[]}`; helpers `useHasPermission`/`usePermissions`.
- [F] Sidebar gates only **Organizations**; IAM always visible. **B12:** 8 of 11 sidebar links
  (`app-sidebar.tsx:24-45`) have no route and land on `/404`.
- [F] No org/branch context switcher (`team-switcher.tsx` unused).

## 8. Performance

- [F] Route-level code splitting exists (all pages except `ErrorPage`).
- [F] The dashboard (landing route after login) bundles `@dnd-kit/*`, `@tanstack/react-table`, `zod`, `recharts`,
  `sonner` to render mock data (`data-table.tsx`, 881 lines).
- [F] Four font families imported globally (`index.css:4-7`); two toast libraries; `next-themes` used without its provider;
  dark mode tracked in three places; `ThemeControllerDrawer` mounted twice.
- [F] Unused dependencies: `@tanstack/react-query-devtools`, `date-fns`; `shadcn` CLI is a runtime dependency.
- Baseline bundle size / LCP: **UNKNOWN — REQUIRES CONFIRMATION** (to be measured in Phase 8).

Files over 400 lines: `components/data-table.tsx` 881, `components/ui/sidebar.tsx` 722 (shadcn),
`pages/dashboard/data.json` 614, `app/dashboard/data.json` 614 (duplicate), `academics-page.tsx` 490,
`theme-controller-drawer.tsx` 452.

## 9. Technical debt

1. ~102 `any` outside `components/ui`; no API/entity types.
2. `strict` off; ESLint not type-aware.
3. Dead files: `src/app/dashboard/data.json` (identical to `pages/dashboard/data.json`), `layouts/AuthLayout.tsx`,
   `layouts/MainLayout.tsx`, `nav-main/nav-user/nav-projects/nav-documents/nav-secondary.tsx`, `team-switcher.tsx`,
   `hooks/useTheme.ts`, `utils/storage.ts`.
4. Duplicated permission helpers in `PermissionEditor.tsx:30-63` and `user-permissions/page.tsx:26-54`; components
   defined inside render (`PermissionsTab.tsx:60`, `user-permissions/page.tsx:136`).
5. `cn` from npm package `cn@0.4.0` instead of `clsx` + `tailwind-merge`. [H] Tailwind class overrides may not merge.
6. Native `<select>`/checkbox mixed with shadcn components.
7. README is the unchanged Vite template.

## 10. Frontend-owned bugs (IDs shared with the BE report)

| # | Bug | Evidence |
|---|---|---|
| B1 | Updates sent as PUT; BE school modules expect PATCH → edit dialogs 404 | `src/services/axios-instance.ts:120-121` |
| B2 | `.env.example` base URL lacks `/api` | `.env.example:1` |
| B3 | Organization summary counts always 0 | `src/hooks/organization/useOrganization.ts:21,35` |
| B4 | `/auth/me` 401 never refreshes → probable redirect loop | `auth-services.ts:11`, `axios-instance.ts:79`, `PrivateRouter.tsx:33-49`, `PublicRouter.tsx:6-7` |
| B11 | User-permissions page keeps one role only; `deny` impossible | `pages/system/iam/user-permissions/page.tsx:123-127`, `hooks/iam/useIam.ts:170` |
| B12 | 8/11 sidebar links 404 | `components/app-sidebar.tsx:24-45`, `routes/router.tsx:131` |
