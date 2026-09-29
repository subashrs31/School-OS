# BDD — Authentication and sign-in eligibility

**Business requirement:** people sign in once, in one place, with strong protection against guessing and theft; a
school without an active licence cannot be used, except by its admins to renew.

**Actors:** school user, school admin, platform staff, the backend (OIDC client), system jobs.
**Layers:** API tests (Supertest on the provider) for protocol rules; Playwright for hosted pages and the full
redirect journey through backend.

```gherkin
Feature: Sign in through the license server

  Background:
    Given school "Alpha" is ACTIVE with an ACTIVE licence
    And identity "teacher@alpha.test" is ACTIVE and a tenant user of "Alpha"

  Scenario: Successful sign-in
    When the user opens School OS and is redirected to the license server
    And signs in with the correct password
    Then the user returns to School OS signed in
    And the access token has audience "school-os-api" and plane "school"

  Scenario: Wrong password does not reveal whether the account exists
    When the user signs in with a wrong password
    Then the page shows "Email or password is incorrect"
    And the same message is shown for an email that does not exist

  Scenario: Lockout after repeated failures
    When the user enters a wrong password 5 times
    Then the account is locked for 15 minutes
    And a correct password is refused until the lock expires
    And the event is recorded in the audit log

  Scenario: Two-factor required for platform staff
    Given identity "ops@platform.test" has plane "platform" and a confirmed TOTP factor
    When the user signs in with the correct password
    Then a 2FA code is requested
    When the user enters a code that was already used
    Then the code is refused

  Scenario: School without an active licence
    Given the licence of school "Alpha" has expired and "Alpha" is INACTIVE
    When "teacher@alpha.test" signs in
    Then sign-in is refused with "your school's access is inactive"

  Scenario: School admin of an inactive school can still reach the renew page
    Given "Alpha" is INACTIVE
    And identity "admin@alpha.test" is a tenant admin of "Alpha"
    When the admin signs in
    Then sign-in succeeds
    And School OS shows only the renewal page

  Scenario: Suspended school is not re-activated by a licence renewal
    Given "Alpha" is SUSPENDED manually
    When its licence is renewed
    Then "Alpha" stays SUSPENDED

  Scenario: Refresh token reuse revokes the session
    Given the user is signed in
    When a refresh token is used a second time
    Then the whole grant is revoked
    And the next request to School OS requires signing in again

  Scenario: Password change signs out other sessions
    Given the user is signed in on two browsers
    When the user changes the password in one browser
    Then the other browser must sign in again on its next token refresh

  Scenario: Forgot password never reveals accounts
    When a reset is requested for an unknown email
    Then the same confirmation is shown as for a known email
    And no email is sent

  Scenario: Set password from an invitation
    Given the backend provisioned "new@alpha.test" with sendSetPassword = true
    When the invitee opens the set-password link within 7 days and sets a valid password
    Then the identity becomes ACTIVE
    And the link cannot be used again

  Scenario: Sign out
    Given the user is signed in
    When the user signs out in School OS
    Then the School OS session and the license-server session both end
```

**Negative / boundary coverage:** exactly 5th failed attempt, lock expiry boundary, TOTP window ±1 step, expired and
reused reset links, identity with mobile only, platform identity added to a tenant (rejected), webhook replay.
