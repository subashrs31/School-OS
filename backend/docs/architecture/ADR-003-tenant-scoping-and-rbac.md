# ADR-003: Tenant scoping and scoped RBAC

**Status:** Accepted (owner, 2026-09-30) · **Date:** 2026-09-29

## Context
Evidence on `origin/dev` (see `current-state.md` §9):
- `authorize()` checks permissions without scope, so organization-scoped role assignments never grant anything
  (`src/middleware/authorize.middleware.ts:38`).
- Membership relies on `user_organizations`, which no code populates; controllers bypass membership for
  primary/secondary roles via an inline `isGlobal` check.
- Services must each remember to filter by `organizationId`; several do not, and update endpoints accept
  `organizationId` from the request body (mass assignment).
- Anyone with `roles.create` can create a `primary` role; anyone with `user-role.create` can grant super-admin.
- Branch scope does not exist; the design doc requires it (§4.5).

The system is a modular monolith with one database (ADR-001); a microservice split would not help isolation.

## Decision
1. **Database wall:** every school-owned table has `organization_id NOT NULL`; branch-owned tables add `branch_id`.
   Children reference parents by the pair `(organization_id, id)` (design §2 rules 1–3).
2. **Assignments carry scope explicitly:** `user_has_roles` / `user_has_permissions` use `scope_type`
   (`global | organization | branch`) with `organization_id` and `branch_id` columns and CHECK constraints for the
   combinations in design §4.5. `user_organizations` is retired.
3. **One authorization function:** `authorize(permissionKey)` middleware reads `:organizationId` / `:branchId` from
   the route, computes effective permissions for that scope in a single query, and attaches
   `req.scope = { userId, organizationId, branchIds, isPlatform }`. Services take `ScopeContext` as their first
   argument and never read tenant ids from the body.
4. **Role semantics:** `primary` = full bypass, global only. `secondary` = platform staff, must hold the permission,
   and may act inside a school only via an active `support_session` for that school. `normal` = school roles,
   organization or branch scope only.
5. **Delegation ceiling:** a grant succeeds only if the granter holds the role's permissions at an equal or wider
   scope; `primary` roles/assignments can only be created by `primary`. Every grant/revoke writes `audit_logs`.
6. **Session freshness:** access tokens are issued by the license server (ADR-005), so backend cannot put its
   own values in them. Instead the local profile `users.access_version` is copied into the BFF session row at sign-in
   and used as the permission-cache key; any role/permission/status change increments it, so the next request
   recomputes permissions and a disabled profile is rejected immediately. The token's `av` claim is the license
   server's identity-level counter (password change, lockout) and is checked separately.
7. **Identity reference:** users are linked to the license server by `users.identity_subject` (its `sub`). The license
   server decides whether a person may sign in to a tenant; this ADR governs what they may do once inside.
8. **Separate namespaces** for platform operations (`/api/v1/platform/...`) and school operations
   (`/api/v1/organizations/:orgId/...`).

## Alternatives considered
| Option | Why not |
|---|---|
| Keep `user_organizations` membership table | Duplicates information already in role assignments; design §0 chooses not to have it |
| Postgres Row-Level Security | Strong, but needs per-request `SET` of tenant context through Prisma (connection pooling complexity); revisit after Phase 9 if code-level scoping proves insufficient |
| `organization_scopes` table (earlier pasted spec) | Extra join for every check; design doc (source of truth) uses explicit columns |

## Consequences
- **+** Cross-school links rejected by Postgres; a missed filter in a service cannot write across tenants.
- **+** One place to test isolation (PICT model `docs/pict/tenancy-and-access.txt`).
- **−** All existing role assignments with `scopeType:'organization'` need their `organization_id` populated during
  migration; FE must pass the active organization in URLs (already does).
- **−** Every service signature changes to accept `ScopeContext` — done module by module in Phase 5.
