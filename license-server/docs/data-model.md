# License server — Data model

> Engine-neutral notation, same legend as `SOS_DATABASE_DESIGN.md` (`ID`, `REF(table)`, `TEXT(n)`, `CHOICE`, `FLAG`,
> `DATETIME`, `JSON`, **NN** = required). Physical DB: PostgreSQL 18, via Prisma.
> **AUDIT** = `created_at` NN · `created_by` · `updated_at` · `updated_by`. **VERSION** = `row_version` NN.
>
> Origin: design doc §4.1 identity columns and §9 subscription tables move here (ADR-005). The backend keeps a
> profile row linked by `identity_subject` = this service's `users.public_id`.

## 1. Tables

| Group | Tables | Count |
|---|---|---|
| Identity | users, user_mfa_factors, password_reset_tokens | 3 |
| Tenancy | tenants, tenant_users | 2 |
| Licensing | plans, plan_features, tenant_licenses, tenant_entitlements | 4 |
| OIDC | oidc_payloads | 1 |
| Integration | webhook_events, webhook_deliveries, outbound_messages | 3 |
| Audit | ls_audit_logs | 1 |
| **Total** | | **14** |

```text
users ─< user_mfa_factors
users ─< password_reset_tokens
users ─< tenant_users >─ tenants ─< tenant_licenses >─ plans ─< plan_features
                          tenants ─< tenant_entitlements
tenants/users ─< webhook_events ─< webhook_deliveries
```

## 2. Identity

### 2.1 `users` — one identity per human · +AUDIT +VERSION
| Column | Type | Rule / why |
|---|---|---|
| id | ID | |
| public_id | TEXT(36) NN | UUID; the OIDC `sub`; stored by the backend as `identity_subject`. Never changes |
| plane | CHOICE(PLATFORM, SCHOOL) NN | Platform and school identities never mix |
| email | TEXT(150) | Unique (case-insensitive) when present |
| email_verified_at | DATETIME | |
| mobile | TEXT(20) | Unique when present, E.164 |
| (rule) | | At least one of email or mobile. Sign-in is by email or mobile (owner, 2026-09-30); there are no login codes |
| display_name | TEXT(120) NN | |
| password_hash | TEXT(255) | Argon2id; empty until the set-password step (invitation or self-service sign-up), and for mobile-code-only parents (LS-8) |
| can_manage_licenses | FLAG NN | Plane PLATFORM only; grants the license-server admin UI (ADR-007 D8) |
| password_changed_at | DATETIME | |
| must_change_password | FLAG NN | |
| status | CHOICE(INVITED, ACTIVE, LOCKED, DISABLED) NN | |
| failed_attempts | NUMBER NN | Reset on success |
| locked_until | DATETIME | |
| last_sign_in_at | DATETIME | |
| access_version | NUMBER NN | Bumped on password change, disable, lock, 2FA reset; emitted as `av` claim |

### 2.2 `user_mfa_factors` · +AUDIT
| Column | Type | Rule / why |
|---|---|---|
| id | ID | |
| user_id | REF(users) NN | |
| type | CHOICE(TOTP) NN | More types later |
| secret_encrypted | TEXT(512) NN | AES-256-GCM, key outside the DB |
| recovery_codes_hashed | JSON NN | List of hashes; each usable once |
| confirmed_at | DATETIME | Factor active only when set |
| last_used_step | NUMBER | Prevents TOTP code replay |

Rule: one confirmed factor per `(user, type)`.

### 2.3 `password_reset_tokens`
| Column | Type | Rule / why |
|---|---|---|
| id | ID | |
| user_id | REF(users) NN | |
| purpose | CHOICE(RESET, SET_PASSWORD) NN | SET_PASSWORD comes from an invitation or a self-service sign-up; using it also verifies the email/mobile |
| token_hash | TEXT(64) NN | SHA-256 of the random token; unique |
| expires_at | DATETIME NN | 15 min reset; 7 days set-password |
| used_at | DATETIME | Single use |
| requested_ip | TEXT(45) | |
| created_at | DATETIME NN | |

## 3. Tenancy

### 3.1 `tenants` — one per school · +AUDIT +VERSION
| Column | Type | Rule / why |
|---|---|---|
| id | ID | |
| public_id | TEXT(36) NN | Equals backend `organizations.public_id`; unique |
| name | TEXT(150) NN | Display copy |
| status | CHOICE(PENDING, ACTIVE, INACTIVE, SUSPENDED, CLOSED) NN | Same values as design §3.1; drives webhooks |
| status_source | CHOICE(MANUAL, LICENSE) NN | SUSPENDED is always MANUAL and not overridden by licences |
| status_reason | TEXT(255) | |
| status_changed_at | DATETIME | |
| signup_source | CHOICE(PLATFORM, SELF_SERVICE) NN | How the school was created (ADR-007); unverified SELF_SERVICE tenants are closed after 7 days (D4) |

### 3.2 `tenant_users` — who may sign in to which school · +AUDIT
| Column | Type | Rule / why |
|---|---|---|
| id | ID | |
| tenant_id | REF(tenants) NN | |
| user_id | REF(users) NN | Plane must be SCHOOL |
| status | CHOICE(INVITED, ACTIVE, REMOVED) NN | |
| is_tenant_admin | FLAG NN | Set by the backend; admins may sign in to an INACTIVE tenant to renew; 2FA required |
| invited_at, activated_at, removed_at | DATETIME | |

Rule: one row per `(tenant_id, user_id)`. Used for sign-in eligibility and seat limits, not for permissions.

## 4. Licensing (design §9, moved here)

### 4.1 `plans` · +AUDIT
id · key TEXT(50) NN unique · name TEXT(100) NN · description · is_trial FLAG NN ·
billing_period CHOICE(MONTHLY, QUARTERLY, YEARLY) (required unless `is_trial`) · duration_days NUMBER (required when
`is_trial`) · price DECIMAL(10,2) NN · currency TEXT(3) NN · grace_days NUMBER NN · student_limit, branch_limit,
staff_limit NUMBER (empty = unlimited) · status CHOICE(ACTIVE, RETIRED) NN

Seed (owner decisions 2026-09-30, editable in the admin UI): plan `trial` — `is_trial`, 7 days, price 0, grace 0 days
(ADR-007 D5), `branch_limit` 1, `student_limit` 100, `staff_limit` 20, all features.

### 4.2 `plan_features`
plan_id REF(plans) NN · feature_key TEXT(50) NN (matches backend `permissions.module`) · limit_value NUMBER
(empty = unlimited). Rule: primary key `(plan_id, feature_key)`.

### 4.3 `tenant_licenses` · +AUDIT +VERSION
| Column | Type | Rule / why |
|---|---|---|
| id | ID | |
| tenant_id | REF(tenants) NN | |
| plan_id | REF(plans) NN | |
| status | CHOICE(TRIAL, ACTIVE, GRACE, EXPIRED, CANCELLED) NN | |
| starts_on | DATE NN | |
| ends_on | DATE NN | |
| grace_ends_on | DATE | ends_on + plan grace_days |
| auto_renew | FLAG NN | |
| student_limit, branch_limit, staff_limit, seat_limit | NUMBER | Copied from the plan, overridable per deal; sent to the backend, which enforces them |
| payment_reference | TEXT(100) | |
| cancelled_at, cancel_reason | DATETIME, TEXT(255) | |

Rule: at most one licence per tenant in TRIAL/ACTIVE/GRACE at a time (partial unique index). A self-service trial
licence is created when the admin completes verification, not at sign-up (ADR-007). One trial per contact: an identity
that was tenant admin of a school with a trial licence cannot start another (enforced in the sign-up service, D2).

### 4.4 `tenant_entitlements`
tenant_id REF NN · feature_key TEXT(50) NN · enabled FLAG NN · limit_value NUMBER · valid_until DATE ·
source CHOICE(PLAN, SPECIAL) NN. Rule: unique `(tenant_id, feature_key)`.

**Licence → tenant status mapping** (design §9.1): TRIAL/ACTIVE/GRACE → ACTIVE; EXPIRED/CANCELLED → INACTIVE
(CLOSED after retention). A daily job evaluates licences and writes status changes; manual SUSPENDED wins.

## 5. OIDC storage

### 5.1 `oidc_payloads` — generic store for the `oidc-provider` adapter
| Column | Type | Rule / why |
|---|---|---|
| id | TEXT(128) NN | Model id |
| type | TEXT(40) NN | Session, Interaction, AuthorizationCode, RefreshToken, Grant, ClientCredentials, … |
| payload | JSON NN | Provider-owned |
| grant_id | TEXT(128) | Index; revoke-by-grant |
| uid | TEXT(128) | Index; session lookup |
| expires_at | DATETIME | Index; expired rows purged by a job |
| consumed_at | DATETIME | Codes/refresh tokens single use |

Primary key `(id, type)`. Access tokens are JWTs and are **not** stored.

## 6. Integration

### 6.1 `webhook_events` — outbox
id · event_id TEXT(36) NN unique · type TEXT(60) NN (`tenant.status_changed`, `license.expiring`, `identity.disabled`, …) ·
tenant_id REF · user_id REF · payload JSON NN · created_at NN

### 6.2 `webhook_deliveries`
id · event_id REF(webhook_events) NN · attempt NUMBER NN · status CHOICE(PENDING, DELIVERED, FAILED) NN ·
response_code NUMBER · next_attempt_at DATETIME · delivered_at DATETIME

### 6.3 `outbound_messages` — every email/SMS this service sends (backs the local dev inbox)
| Column | Type | Rule / why |
|---|---|---|
| id | ID | |
| channel | CHOICE(EMAIL, SMS) NN | |
| to_address | TEXT(150) NN | Email address or E.164 mobile number |
| template | TEXT(60) NN | `set_password`, `reset_password`, `verify_mobile`, `license_expiring`, … |
| subject | TEXT(200) | Email only |
| body | TEXT(4000) NN | Rendered text |
| link | TEXT(500) | The actionable link, if any (shown clickable in the dev inbox) |
| code | TEXT(10) | The one-time code, if any (SMS) |
| transport | CHOICE(DEV_INBOX, SMTP, TWILIO) NN | How it was delivered |
| status | CHOICE(STORED, SENT, FAILED) NN | STORED = dev inbox only |
| error | TEXT(500) | Delivery error, if any |
| created_at | DATETIME NN | |

Index `(created_at)`. Local-only rows are purged after 7 days. Links and codes are single-use secrets: rows are visible
only through the local dev inbox; in other environments only the delivery status is kept (`link`/`code` stored empty).

## 7. Audit

### 7.1 `ls_audit_logs` — append-only
id · occurred_at NN · actor_type CHOICE(USER, CLIENT, SYSTEM) NN · actor_id TEXT(64) · action TEXT(100) NN
(`signin.succeeded`, `signin.failed`, `password.reset`, `mfa.enrolled`, `tenant.status_changed`, `license.created`, …) ·
tenant_id REF · target_user_id REF · outcome CHOICE(SUCCESS, DENIED) NN · ip_address TEXT(45) · user_agent TEXT(255) ·
details JSON. Index `(occurred_at)`, `(tenant_id, occurred_at)`, `(target_user_id, occurred_at)`.

## 8. Create order
users → user_mfa_factors, password_reset_tokens → tenants → tenant_users → plans → plan_features → tenant_licenses,
tenant_entitlements → oidc_payloads → webhook_events → webhook_deliveries → outbound_messages → ls_audit_logs.
