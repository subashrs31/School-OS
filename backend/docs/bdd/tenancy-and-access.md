# BDD — Tenancy and access (database layer, sub-phase 2.1)

**Business requirement:** one school's data can never be linked to, or reached from, another school; branch-scoped
access stays inside its own school; business codes are unique per school, not globally.

**Actors:** platform super admin (seeding), school admin (creates branches), system (assignments).
**Layer:** integration tests against the test PostgreSQL database. API/UI scenarios for the same rules are added in
Phase 4.3 (`authorize()`) and Phase 6.

```gherkin
Feature: Tenant isolation enforced by the database

  Background:
    Given school "Alpha" with default branch "A-MAIN"
    And school "Beta" with default branch "B-MAIN"
    And role "teacher" of type "normal"

  Scenario: Branch-scoped assignment inside its own school
    When a branch-scoped "teacher" assignment is created for school "Alpha" and branch "A-MAIN"
    Then the assignment is stored

  Scenario: Branch-scoped assignment pointing at another school's branch
    When a branch-scoped "teacher" assignment is created for school "Beta" and branch "A-MAIN"
    Then the database rejects it with a foreign-key violation

  Scenario Outline: Scope columns must match the scope type
    When an assignment is created with scope "<scope>", organization "<org>" and branch "<branch>"
    Then the result is "<result>"

    Examples:
      | scope        | org   | branch | result   |
      | global       | empty | empty  | stored   |
      | global       | Alpha | empty  | rejected |
      | organization | Alpha | empty  | stored   |
      | organization | Alpha | A-MAIN | rejected |
      | organization | empty | empty  | rejected |
      | branch       | Alpha | A-MAIN | stored   |
      | branch       | Alpha | empty  | rejected |

  Scenario: Only one active identical assignment
    Given an active organization-scoped "teacher" assignment for user "u1" in "Alpha"
    When the same assignment is created again
    Then the database rejects it as a duplicate
    But after the first assignment is revoked, creating it again succeeds

  Scenario: One default branch per school
    When a second branch with is_default = true is created in "Alpha"
    Then the database rejects it

  Scenario: Branch codes are unique per school, not globally
    When branch code "MAIN" is created in "Alpha" and in "Beta"
    Then both are stored
    When branch code "MAIN" is created again in "Alpha"
    Then the database rejects it

  Scenario: One profile per license-server identity
    Given a profile linked to identity subject "ls-123"
    When another profile is created for identity subject "ls-123"
    Then the database rejects it

  Scenario: The school database stores no credentials
    When the users table columns are inspected
    Then there is no password, two-factor or lockout column

  Scenario: Seeding is idempotent and needs a real identity subject
    Given SEED_SUPER_ADMIN_SUBJECT is not set
    When the seed runs
    Then it fails with a clear message and creates nothing
    Given SEED_SUPER_ADMIN_SUBJECT is set
    When the seed runs twice
    Then roles, permissions, the super-admin profile and its global assignment each exist exactly once
```

**Negative / boundary coverage:** empty scope columns, cross-school pairs, duplicate after revoke, duplicate identity
subject, missing env. Credential scenarios (login, lockout, 2FA) live in the license-server repo
(`docs/bdd/authentication.md`). **Authorization/error conditions** are asserted as Postgres error codes (`23503` FK, `23505` unique, `23514`
check) mapped by the test helper.
