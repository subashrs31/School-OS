# ADR-005: Separate license server for identity and licensing (OpenID Connect)

**Status:** Proposed · **Date:** 2026-09-30 · **Supersedes:** OAuth parts of `current-state.md` §8 (Google/Microsoft)

## Context
- Owner decisions (2026-09-30): no Google/Microsoft sign-in; a custom **license server** runs authentication for
  the multi-tenant School OS clients; it owns **identity and licenses**; protocol **OpenID Connect**; it serves
  **School OS only** (tenant = school).
- Today school-os-be does its own password login, JWT signing, reset and (broken) OAuth
  (`src/services/auth.service.ts`, `src/services/oauth.service.ts`, `src/config/passport.ts`). It has the token-expiry,
  plaintext reset token, enumeration and CSRF defects recorded in `current-state.md` §8.
- `SOS_DATABASE_DESIGN.md` §9 plans a subscription ("membership") module that drives `organizations.status`
  (`status_source = SUBSCRIPTION`). The license server is where that module now lives.

## Decision

```mermaid
flowchart LR
  U[Browser: school-os-fe] -->|1. GET /api/v1/auth/login| BE[school-os-be<br/>OIDC confidential client - BFF]
  BE -->|2. 302 authorize: code + PKCE + state| LS[school-os-license-server<br/>oidc-provider + licensing]
  U -->|3. hosted login, 2FA, reset| LS
  LS -->|4. 302 callback with code| BE
  BE -->|5. token exchange - client secret| LS
  BE -->|6. HttpOnly session cookie| U
  BE -->|7. verify access JWT via cached JWKS| BE
  LS -. 8. signed webhook: tenant/license status .-> BE
  BE -. 9. client-credentials admin API: provision identity .-> LS
  LS --> LDB[(PostgreSQL: license DB)]
  BE --> SDB[(PostgreSQL: school DB)]
```

1. **New application and repository** `school-os-license-server`: Node 24, TypeScript (ESM), Express 4,
   `oidc-provider` 9.12.x (MIT), Prisma 7.10.x, PostgreSQL 16 with its own database. Deployed separately.
2. **Flow:** OIDC Authorization Code + PKCE. **school-os-be is a confidential client acting as a
   backend-for-frontend (BFF):** it runs the code exchange with `openid-client` 6.8.x, keeps access/refresh tokens
   server-side, and gives the SPA an HttpOnly, SameSite session cookie plus the CSRF cookie. No token reaches browser
   JavaScript. The SPA login page becomes a redirect to `/api/v1/auth/login`.
3. **Tokens:** access token is a JWT (RS256) for resource `school-os-api` (resource indicators, RFC 8707).
   Claims: `sub` (license-server user `public_id`), `plane` (`platform|school`), `av` (license-server identity
   version, bumped on password change/lockout/disable), `amr`. School-level access freshness uses the school-os-be
   profile's own `access_version` (ADR-003 §6). Access 10 min; rotating refresh tokens (reuse → family revoked). Signing keys rotated, published via JWKS.
4. **Verification:** school-os-be verifies tokens locally with `jose` 6.2.x against a cached JWKS (refetch on
   unknown `kid`). There is no call to the license server per request.
5. **Ownership split**

   | License server | school-os-be |
   |---|---|
   | Identity: email/mobile, password hash, 2FA, status, lockout, password history | `users` = profile keyed by `identity_subject` (license-server `sub`): display name, plane, status, `access_version`, contact copies |
   | Tenants (one per school, linked by `organizations.public_id`) and `tenant_users` (who may sign in to which tenant) | Organizations, branches and all school data |
   | Plans, features, tenant licenses, entitlements (design §9) | `organizations.status` driven by license events (`status_source = SUBSCRIPTION`); manual `SUSPENDED` still overrides |
   | Sessions, grants, refresh tokens, login audit | RBAC (roles, permissions, scoped assignments, delegation ceiling), `audit_logs` |
   | Hosted UI: login, 2FA, forgot/reset password, set password from invitation | Invitations (design §4.7) |

6. **License enforcement, two layers:** (a) the license server refuses sign-in to a tenant whose license or status is
   inactive; (b) it sends HMAC-signed webhooks on tenant/license changes, and school-os-be updates
   `organizations.status` and writes `audit_logs`. A daily reconciliation job pulls tenant status to catch missed
   webhooks.
7. **Invitations:** school-os-be keeps the invitation record. On send it calls the license-server admin API
   (OAuth client-credentials, scope `identities:provision`) to find or create the identity and add a `tenant_users`
   row; the license server emails the set-password link. On first sign-in school-os-be links `identity_subject` to the
   staff/guardian/student record and activates the role assignment.
8. **Removed from school-os-be:** password login, register, forgot/reset, bcrypt, passport and strategies, OAuth,
   JWT signing, `user_oauth_accounts`, `src/database/resetPasswords.ts`, OTP helpers (moved to the license server if needed).

## Alternatives considered (owner reviewed 2026-09-30)
| Option | Why not |
|---|---|
| Keep auth inside school-os-be | Owner wants a separate app authenticating multi-tenant clients |
| Custom JWT login API instead of OIDC | Non-standard; every future client re-implements session/refresh/logout semantics |
| Keycloak / hosted IdP | Owner wants a custom license server; licensing logic would still be custom |
| License server also owns RBAC | School roles are scoped to branches/sections and change with school data; keeping them next to that data avoids cross-service consistency problems |
| SPA as public client (PKCE, tokens in browser memory) | Tokens exposed to JS/XSS; loses the existing HttpOnly cookie model |
| Google / Microsoft sign-in | Not required (owner) |

## Consequences
- **+** Credentials, 2FA and lockout live in one hardened service; school-os-be no longer stores passwords.
- **+** Standard OIDC endpoints (discovery, JWKS, end-session) make adding a mobile app or a parent portal a client
  registration, not new auth code.
- **+** Subscriptions/licenses have a clear home; `organizations.status` stays the single switch school-os-be reads.
- **−** Two services and two databases to deploy, back up and monitor; local development needs both running
  (docker-compose will start the license server, API and both databases).
- **−** Cross-service consistency: `users` in both systems are linked only by `identity_subject`; webhook delivery
  must be idempotent (event id) and retried; reconciliation job required.
- **−** Module format: `oidc-provider`, `openid-client` and `jose` are ESM-only while school-os-be compiles to
  CommonJS. Node 24 can `require()` synchronous ESM; a spike in Phase 2.0 confirms it, otherwise school-os-be moves
  to `"module": "nodenext"`.
- **−** Hosted login pages are a new UI surface → mockup and approval gate (LS-2).
- `SOS_DATABASE_DESIGN.md` §4.1 (`users`) and §9 (subscription tables) are **split** between the two databases as in
  the table above; the design doc should be annotated accordingly (owner's document, not edited here).
