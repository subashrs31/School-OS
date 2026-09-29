# License server — Architecture (Proposed)

> Decision record: [ADR-005](../../backend/docs/architecture/ADR-005-license-server-oidc.md). This document details it.
> Status: **Proposed — awaiting approval.** No code exists yet.

## 1. Context

```mermaid
flowchart LR
  subgraph Users
    PU[Platform staff]
    SU[School users]
  end
  PU & SU -->|browser| FE[frontend SPA]
  PU & SU -->|hosted login pages| LS
  FE -->|/api/v1 + session cookie| BE[backend<br/>OIDC client / BFF]
  BE -->|authorize redirect, token, JWKS, end-session| LS[license-server]
  BE -->|admin API - client credentials| LS
  LS -->|signed webhooks| BE
  LS --> DB[(PostgreSQL: license DB)]
  LS --> SMTP[SMTP: reset / set-password / 2FA mails]
```

- One tenant = one school (School OS only). Tenant id is shared with the backend as `organizations.public_id`.
- The license server knows **who may sign in** and **whether a school is licensed**. It does not know school roles.

## 2. Components

```text
src/
├── server.ts, app.ts           Express app; mounts oidc-provider under /
├── oidc/
│   ├── provider.ts             Provider config (features, TTLs, claims, clients, jwks, cookies)
│   ├── adapter.ts              Prisma adapter for oidc-provider models (sessions, grants, codes, refresh tokens)
│   ├── account.ts              findAccount(): loads identity, builds claims
│   └── interactions/           Express routes for login, 2FA, consent-free first-party flow
├── modules/
│   ├── identities/             credentials, lockout, password reset, 2FA
│   ├── tenants/                tenants, tenant users, sign-in eligibility
│   ├── licenses/               plans, features, licenses, entitlements, expiry job
│   ├── admin-api/              /admin/v1 for the backend (client credentials)
│   └── webhooks/               outbox, signing, delivery with retries
├── views/                      server-rendered hosted pages (see §6)
└── lib/                        prisma, logger, crypto, mailer
```

## 3. OIDC configuration (`oidc-provider` 9.12.x)

| Setting | Value | Why |
|---|---|---|
| Issuer | `LS_ISSUER` env, e.g. `https://auth.<domain>` | Stable `iss` checked by the backend |
| Clients | `school-os-backend`: confidential, `client_secret_basic`, grant types `authorization_code`, `refresh_token`, `client_credentials`; redirect URI `…/api/v1/auth/callback`; post-logout URI `…/` | BFF + admin API use the same registered client, different grants |
| PKCE | required (S256) for every authorization-code request | Defence in depth even for the confidential client |
| Scopes | `openid`, `profile`, `email`, `offline_access`; admin scopes `identities:provision`, `tenants:manage`, `licenses:read` | Admin scopes only via `client_credentials` |
| Resource indicators | resource `school-os-api` → access token format **JWT**, RS256, audience `school-os-api` | Lets backend verify locally |
| Access token TTL | 10 min | Short; BFF refreshes server-side |
| Refresh token | rotating, TTL 7 days idle / 30 days absolute; reuse revokes the whole grant | Theft detection |
| ID token claims | `sub`, `name`, `email`, `email_verified`, `amr`, `auth_time` | Standard |
| Access token extra claims | `plane` (`platform`/`school`), `av` (identity version) | the backend needs the plane; `av` invalidates tokens after password change/lockout |
| Features enabled | `resourceIndicators`, `clientCredentials`, `revocation`, `rpInitiatedLogout` | Only what the flows need |
| Features disabled | dynamic registration, device flow, introspection (JWT verified locally) | Smaller attack surface |
| Consent | skipped for first-party client (grant created programmatically in the interaction) | Single first-party product |
| Keys | RS256 signing keys loaded from secret storage as JWKS; two active (current + next) for rotation; never in the database | Rotation without downtime |
| Cookies | `LS_COOKIE_KEYS` (rotating list), `SameSite=Lax`, `Secure` outside local | oidc-provider session/interaction cookies |

## 4. Sign-in eligibility

Checked in the login interaction after credentials (and 2FA) succeed, and again on every refresh:

| Rule | Result if violated |
|---|---|
| Identity `status = ACTIVE` and not locked | sign-in refused, generic message |
| Plane `platform` → always eligible (still needs 2FA) | — |
| Plane `school` → at least one `tenant_users` row `ACTIVE` whose tenant is `ACTIVE` with a licence in `TRIAL/ACTIVE/GRACE` | refused with "your school's access is inactive"; school admins of an INACTIVE tenant are allowed in so they can see the renew page (design §3.1) |
| `av` in the refresh token older than identity `access_version` | refresh refused → user must sign in again |

Per-school access for a user who belongs to several schools is enforced by the backend using `organizations.status`,
which this service keeps in sync through webhooks.

## 5. Integration contracts with the backend

| Direction | Mechanism | Detail in |
|---|---|---|
| BE → LS sign-in | OIDC authorization code + PKCE, token endpoint | `api.md` §1 |
| BE verifies tokens | JWKS at `/jwks`, cached; refetch on unknown `kid` | `api.md` §1 |
| BE → LS provisioning | `/admin/v1/*` with client-credentials token | `api.md` §2 |
| LS → BE status | HMAC-signed webhooks from an outbox, retried | `api.md` §3 |
| BE → LS reconciliation | `GET /admin/v1/tenants?updatedSince=` daily | `api.md` §2 |

## 6. Hosted pages

Login (email or mobile + password), 2FA code, forgot password, reset password, set password (from invitation), signed
out, and "school access inactive". Server-rendered, no SPA framework, same visual language as the frontend (shared
colour tokens). **Mockups require owner approval before implementation (LS-2).** Pages are covered by Playwright.

## 7. Security

- Passwords: Argon2id (library chosen and approved in LS-3), per-identity lockout after 5 failures for 15 min plus
  IP rate limiting; password reset tokens stored as SHA-256 hashes, single use, 15 min; forgot-password always 200.
- 2FA: TOTP, secret encrypted at rest (AES-256-GCM, key from secret storage); hashed recovery codes; required for
  plane `platform` and for school admins (role flag supplied by the backend at provisioning).
- Admin API: client-credentials only, scope-checked per route, rate limited, every call in `ls_audit_logs`.
- Webhooks: HMAC-SHA256 over `timestamp.body`, 5-minute replay window, unique event id.
- No secrets in logs; request id propagated (`X-Request-Id`) to backend calls.

## 8. Deployment

Own container and own PostgreSQL database; must be reachable by browsers (hosted pages) and by backend.
Local: a `docker-compose.yml` at the repository root starts web, api, license server and both databases. Backups
separate from the school database. Hosting target: **UNKNOWN — REQUIRES CONFIRMATION** (same answer as the backend).

## 9. Open questions

1. Login identifier: email and mobile only, or also the current uuid-style codes (`DNSTSA0001`)?
2. Who manages plans and licenses day to day — platform screens in the frontend (calling the backend, which calls
   this admin API), or a small admin UI in this service? (LS-4)
3. Payment provider integration — out of scope until chosen.
