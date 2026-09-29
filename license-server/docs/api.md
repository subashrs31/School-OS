# License server — API contract (Proposed)

> Three surfaces: (1) standard OIDC endpoints, (2) the admin API used only by school-os-be, (3) webhooks sent to
> school-os-be. An OpenAPI file (`docs/api/openapi.yaml`) is generated from these routes in LS-5.
> Paths for OIDC endpoints are `oidc-provider` defaults; all others are owned by this service.

## 1. OIDC endpoints (public)

| Method | Path | Purpose | Notes |
|---|---|---|---|
| GET | `/.well-known/openid-configuration` | Discovery | school-os-be reads it at startup |
| GET | `/jwks` | Public signing keys | Cache-Control set; clients refetch on unknown `kid` |
| GET | `/auth` | Authorization (code + PKCE S256 + state + nonce + `resource=school-os-api`) | Redirects to `/interaction/:uid` |
| GET/POST | `/interaction/:uid[/login|/mfa]` | Hosted login and 2FA steps | Server-rendered; CSRF-protected forms |
| POST | `/token` | Code exchange, refresh, client credentials | `client_secret_basic` |
| POST | `/token/revocation` | Revoke refresh token | Used by BFF logout |
| GET | `/session/end` | RP-initiated logout | `post_logout_redirect_uri` must be registered |
| GET/POST | `/password/forgot`, `/password/reset/:token`, `/password/set/:token` | Hosted password pages | Forgot always answers the same way (no enumeration) |

**Access token (JWT) claims** — `iss`, `aud = school-os-api`, `sub`, `exp`, `iat`, `jti`, `client_id`, `scope`,
`plane`, `av`, `amr`. school-os-be **must** check `iss`, `aud`, `exp`, algorithm `RS256`.

**Errors** follow OIDC/OAuth (`invalid_grant`, `invalid_client`, `access_denied`, `login_required`). Sign-in refusals for
eligibility return `access_denied` with `error_description` limited to: `account_inactive`, `school_access_inactive`.

## 2. Admin API — `/admin/v1` (school-os-be only)

Auth: `Authorization: Bearer <client-credentials token>` from `/token` with the listed scope. JSON bodies, validated;
unknown fields rejected. Responses `{ data }` or `{ error: { code, message } }`. Every call → `ls_audit_logs`.
Rate limit: 60 req/min per client.

| Method | Path | Scope | Request | Response | Status codes |
|---|---|---|---|---|---|
| POST | `/tenants` | `tenants:manage` | `{ publicId, name }` | tenant | 201; 409 if publicId exists |
| GET | `/tenants/:publicId` | `licenses:read` | — | `{ publicId, status, statusSource, license: { planKey, status, endsOn, graceEndsOn, limits } }` | 200, 404 |
| GET | `/tenants?updatedSince=&page=&pageSize=` | `licenses:read` | — | page of tenant summaries (reconciliation) | 200 |
| PATCH | `/tenants/:publicId/status` | `tenants:manage` | `{ status: SUSPENDED\|ACTIVE\|CLOSED, reason }` | tenant | 200, 404, 409 (invalid transition) |
| POST | `/identities` | `identities:provision` | `{ email?, mobile?, displayName, plane }` — find by email/mobile or create as INVITED | `{ sub, status, created }` | 200 found / 201 created; 422 if neither contact given |
| POST | `/tenants/:publicId/users` | `identities:provision` | `{ sub, isTenantAdmin, sendSetPassword: boolean }` | tenant-user | 201; 409 if already ACTIVE; 422 if plane is PLATFORM |
| PATCH | `/tenants/:publicId/users/:sub` | `identities:provision` | `{ status?: REMOVED, isTenantAdmin? }` | tenant-user | 200, 404 |
| POST | `/identities/:sub/disable` | `identities:provision` | `{ reason }` | identity | 200, 404 |

Licences (plans, create/renew/cancel licence) get their own routes in **LS-4**, after the owner decides who manages
them (see `architecture.md` §9).

Why these are single-record endpoints: invitations provision one person at a time; bulk import (design EXECUTION_ORDER
user import) will get a dedicated batch route only when that feature is built.

## 3. Webhooks — LS → school-os-be

Target: `POST {SCHOOL_OS_API}/api/v1/auth/license-events` (configured per environment).

| Header | Value |
|---|---|
| `X-LS-Event-Id` | UUID, unique per event (idempotency key) |
| `X-LS-Timestamp` | Unix seconds |
| `X-LS-Signature` | `sha256=` + hex HMAC-SHA256(`LS_WEBHOOK_SECRET`, `${timestamp}.${rawBody}`) |

Receiver rules: reject if the signature is wrong or the timestamp is more than 5 minutes off; return 200 for an event
id already processed; return 2xx only after the change is committed.

Delivery: from the `webhook_events` outbox; retries with exponential back-off (1 min → 24 h, 10 attempts); after that
the delivery is FAILED and appears in the admin report. The daily reconciliation `GET /admin/v1/tenants?updatedSince=`
closes any gap.

| Event `type` | Payload | school-os-be action |
|---|---|---|
| `tenant.status_changed` | `{ tenantPublicId, from, to, source, reason, occurredAt }` | update `organizations.status`, `status_source`, `status_reason`; `audit_logs` row |
| `license.expiring` | `{ tenantPublicId, endsOn, daysLeft }` | show renewal banner to school admins |
| `license.changed` | `{ tenantPublicId, planKey, status, limits }` | refresh cached entitlements/limits |
| `identity.disabled` | `{ sub, reason }` | set local profile DISABLED, bump `access_version` |
