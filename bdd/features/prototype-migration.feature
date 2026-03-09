@prototype
Feature: Prototype migration
  Prototypes support versioned migrations (Flyway-style).
  Each migration is executed once and recorded in history.

  Background:
    Given a fresh Rolex instance

  # ===== First-time settle =====

  Scenario: Settle a prototype with V1 migration
    Given a prototype "test-proto" with migrations:
      | file              | ops                                                          |
      | V1__initial.json  | [{"op":"!society.found","args":{"id":"test-org","content":"Feature: Test Org"}}] |
    When I settle prototype "test-proto"
    Then organization "test-org" should exist
    And migration "V1__initial" of "test-proto" should be recorded

  # ===== Incremental upgrade =====

  Scenario: Re-settle only executes new migrations
    Given a prototype "test-proto" with migrations:
      | file              | ops                                                          |
      | V1__initial.json  | [{"op":"!society.found","args":{"id":"test-org","content":"Feature: Test Org"}}] |
      | V2__add_pos.json  | [{"op":"!position.establish","args":{"id":"test-pos","content":"Feature: Test Pos"}}] |
    And prototype "test-proto" has been settled at V1
    When I settle prototype "test-proto"
    Then migration "V2__add_pos" of "test-proto" should be recorded
    And migration count of "test-proto" should be 2

  # ===== Already up-to-date =====

  Scenario: Settle skips when all migrations are applied
    Given a prototype "test-proto" with migrations:
      | file              | ops                                                          |
      | V1__initial.json  | [{"op":"!society.found","args":{"id":"test-org","content":"Feature: Test Org"}}] |
    And prototype "test-proto" has been settled at V1
    When I settle prototype "test-proto"
    Then the settle result should contain "up to date"

  # ===== Ordering =====

  Scenario: Migrations execute in version order
    Given a prototype "test-proto" with migrations:
      | file              | ops                                                          |
      | V2__second.json   | [{"op":"!position.establish","args":{"id":"pos-2","content":"Feature: Pos 2"}}] |
      | V1__first.json    | [{"op":"!society.found","args":{"id":"org-1","content":"Feature: Org 1"}}] |
    When I settle prototype "test-proto"
    Then organization "org-1" should exist
    And migration "V1__first" of "test-proto" should be recorded
    And migration "V2__second" of "test-proto" should be recorded
    And migration count of "test-proto" should be 2
