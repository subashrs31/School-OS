# Sub-phase LS-1 — Identity schema and OIDC core

**Status:** Spec — not started · **Depends on:** LS-0 scaffold, ADR-005 approved
**Task type:** New application / architecture

## 1. Requirement
Stand up the OpenID Connect provider so backend can sign a user in with authorization code + PKCE, receive a
JWT access token for `school-os-api`, refresh it with rotating refresh tokens, verify it via JWKS, and sign out.

## 2. Scope
**In:** `users`, `oidc_payloads`, `ls_audit_logs` tables; Prisma adapter for `oidc-provider`; provider configuration
(`architecture.md` §3); `findAccount` with `plane` and `av` claims; a **minimal unstyled** login interaction
(email + password) sufficient for automated tests; seed of one platform identity and the `school-os-backend` client.

**Out:** styled hosted pages (LS-2, mockup gate), lockout/2FA/reset (LS-3), tenants and licences (LS-4), admin API
and webhooks (LS-5).

## 3. Dependencies (LS-0 delivers)
- Repo scaffold: Node 24, TypeScript ESM, Express 4, Vitest, Supertest, Prisma 7.10.x, docker-compose Postgres.
- New runtime deps for LS-1 (approval required): `oidc-provider` 9.12.x (MIT), `argon2` (version fixed at approval).
- Env: `LS_ISSUER`, `LS_DATABASE_URL`, `LS_TEST_DATABASE_URL`, `LS_JWKS` (private JWKS JSON from secret storage),
  `LS_COOKIE_KEYS`, `SCHOOL_OS_CLIENT_SECRET`, `SCHOOL_OS_REDIRECT_URI`, `SCHOOL_OS_POST_LOGOUT_URI`,
  `SEED_PLATFORM_ADMIN_EMAIL`, `SEED_PLATFORM_ADMIN_PASSWORD`.

## 4. Acceptance criteria
1. **Given** the provider is running, **when** `/.well-known/openid-configuration` is requested, **then** it lists the
   issuer, `/auth`, `/token`, `/jwks`, `/session/end`, `S256` as the only PKCE method, and `RS256`.
2. **Given** an authorization request **without** `code_challenge`, **then** it is rejected (`invalid_request`).
3. **Given** a valid code + PKCE request with `resource=school-os-api` and correct credentials, **when** the code is
   exchanged with the client secret, **then** the response contains an RS256 JWT access token with `aud = school-os-api`,
   `sub` = identity `public_id`, `plane`, `av`, `exp` 10 minutes ahead, and a refresh token.
4. **Given** that access token, **when** verified with `jose` against `/jwks`, **then** verification succeeds; a token
   signed with another key fails.
5. **Given** a refresh token, **when** used, **then** a new pair is issued; **when** the old one is reused, **then**
   `invalid_grant` and the grant is revoked (later refresh with the new token also fails).
6. **Given** an identity whose `access_version` was incremented after the token was issued, **when** refresh is
   attempted, **then** it is refused.
7. **Given** a DISABLED identity, **when** signing in, **then** `access_denied` / `account_inactive`, and an
   `ls_audit_logs` row with outcome DENIED is written.
8. **Given** a signed-in session, **when** `/session/end` is called with the registered post-logout URI, **then** the
   session is destroyed and the refresh token is revoked.
9. The code, refresh token and session rows are stored via the Prisma adapter; codes are single use (`consumed_at`).
10. Seed is idempotent and fails clearly when `SEED_PLATFORM_ADMIN_PASSWORD` is missing (no default password).

## 5. BDD / PICT
Scenarios "Successful sign-in", "Refresh token reuse revokes the session", "Sign out", "Wrong password…" from
`docs/bdd/authentication.md`. PICT rows with `Plane = platform|school`, `IdentityStatus`, `Credential` from
`docs/pict/authentication.txt` (tenant/licence parameters fixed to ACTIVE until LS-4).

## 6. Test strategy
| Layer | What |
|---|---|
| Unit (Vitest) | claims builder, eligibility function (identity part), adapter mapping |
| Integration (Vitest + test Postgres) | adapter CRUD and expiry purge, seed idempotency |
| API (Supertest, full OIDC dance with a test client) | AC1–AC9 |
| Contract | a test in the backend (Phase 4.1) runs the same dance with `openid-client` against a running LS |
| Playwright | not in LS-1 (unstyled page); starts in LS-2 |

TDD order: write the Supertest OIDC-dance tests first (fail: server missing) → implement config/adapter → pass.

## 7. Expected files
`prisma/schema.prisma`, `prisma/seed.ts`, `src/app.ts`, `src/server.ts`, `src/oidc/provider.ts`, `src/oidc/adapter.ts`,
`src/oidc/account.ts`, `src/oidc/interactions/login.ts`, `src/lib/{prisma,logger}.ts`, `test/api/oidc-flow.test.ts`,
`test/integration/adapter.test.ts`, `.env.example`, `docker-compose.yml`.

## 8. Database changes
New license database only. The owner runs the migration commands (the assistant does not):
```bash
docker compose up -d ls-postgres
npx prisma migrate dev --create-only --name init_identity_oidc   # review SQL
npx prisma migrate dev
DATABASE_URL=$LS_TEST_DATABASE_URL npx prisma migrate reset --force   # test DB only
npm run db:seed
```

## 9. API changes
New OIDC endpoints only (`docs/api.md` §1). No admin API yet.

## 10. Risks
| Risk | Mitigation |
|---|---|
| `oidc-provider` major-version API differences | pin 9.12.x; follow its documented configuration; AC tests cover each feature used |
| Keys committed by accident | JWKS only from env/secret storage; gitleaks in CI; `.env` ignored |
| The backend (CommonJS) cannot load `openid-client`/`jose` (ESM) | ESM/CJS spike in LS-0 (ADR-005 consequence) |
