# BDD — Self-service school sign-up and trial (ADR-007)

**Business requirement:** a school can sign itself up for a 7-day free trial with all features and small limits, without
platform staff, and without School OS ever handling a password.

**Actors:** visitor (future school admin), school admin, platform staff (license-server admin UI), system jobs.
**Layers:** API tests (backend public endpoint, LS `school-signups`), integration (webhooks, limits), Playwright for the
sign-up page and the set-password page.

```gherkin
Feature: Self-service school sign-up with a free trial

  Scenario: A new school signs up with an email address
    Given no school or account exists for "head@greenvalley.example"
    When a visitor submits the sign-up form with school "Green Valley School", name "Asha Rao" and that email
    Then the page says "Check your email or phone to continue"
    And a school "Green Valley School" exists with status PENDING
    And "head@greenvalley.example" receives a verify-and-set-password link

  Scenario: The trial starts when the admin sets a password
    Given a PENDING sign-up for "Green Valley School"
    When the admin opens the link, sets a valid password and enrols 2FA
    Then the school becomes ACTIVE with a TRIAL licence ending 7 days from today
    And the admin can sign in and sees the school setup screens

  Scenario: Sign-up with a mobile number instead of an email
    When a visitor signs up with mobile "+91 98765 43210" and no email
    Then an SMS code to verify and set a password is sent to that number

  Scenario: Email or mobile is required
    When a visitor submits the form without email and without mobile
    Then the form shows "Enter an email address or a mobile number"
    And no school is created

  Scenario: One trial per contact
    Given "head@greenvalley.example" already administered a trial school
    When a visitor signs up another school with that email
    Then the page still says "Check your email or phone to continue"
    And the email explains that a trial was already used and how to contact the School OS team
    And no new school is created

  Scenario: Unverified sign-ups are closed
    Given a PENDING sign-up whose link was never used
    When 7 days have passed
    Then the school and its tenant become CLOSED

  Scenario: Trial limits are enforced
    Given an ACTIVE trial school with 100 students
    When the admin adds another student
    Then the request is refused with "LICENSE_LIMIT_REACHED"
    And the message says the trial allows 100 students

  Scenario Outline: Other trial limits
    Given an ACTIVE trial school with <existing> <kind>
    When the admin adds one more <kind>
    Then the result is "<result>"

    Examples:
      | kind     | existing | result                |
      | branch   | 0        | created               |
      | branch   | 1        | LICENSE_LIMIT_REACHED |
      | staff    | 19       | created               |
      | staff    | 20       | LICENSE_LIMIT_REACHED |
      | students | 99       | created               |

  Scenario: The trial ends
    Given an ACTIVE trial school whose trial ended yesterday
    Then the school is INACTIVE
    And a teacher of that school cannot sign in
    And the school admin can sign in and sees only the renewal page

  Scenario: Platform staff upgrade a trial
    Given an INACTIVE school whose trial ended
    When platform staff assign a paid plan in the license-server admin UI
    Then the school becomes ACTIVE with the paid plan's limits

  Scenario: Suspension overrides the trial
    Given an ACTIVE trial school
    When platform staff suspend it with a reason
    Then nobody from that school can sign in, including its admins

  Scenario: Sign-up abuse is throttled
    Given 5 sign-ups from the same IP address in the last hour
    When a 6th sign-up is submitted from that IP address
    Then the request is refused with status 429

  Scenario: Two schools may share a name
    Given a school "Green Valley School" exists
    When another school signs up as "Green Valley School"
    Then both exist, with slugs "green-valley-school" and "green-valley-school-2"
```

Items marked D1–D8 in ADR-007 (rate limit, one trial per contact, expiry of unverified sign-ups, slug suffix) are
**defaults accepted by the owner on 2026-09-30**; these scenarios change if the owner changes them.
