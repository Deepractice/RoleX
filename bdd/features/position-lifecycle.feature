@position
Feature: Position lifecycle
  Establish, charge duty, require skill, appoint, dismiss, abolish.

  Background:
    Given a fresh Rolex instance
    And organization "acme" exists

  # ===== establish =====

  Scenario: Establish creates a position
    When I direct "!position.establish" with:
      | content | Feature: CTO |
      | id      | acme/cto     |
    Then the result process should be "establish"
    And the result state name should be "position"
    And the result state id should be "acme/cto"

  # ===== charge =====

  Scenario: Charge assigns a duty to a position
    Given position "acme/cto" exists
    When I direct "!position.charge" with:
      | position | acme/cto                         |
      | content  | Feature: Own technical direction  |
      | id       | tech-direction                   |
    Then the result process should be "charge"
    And the result state name should be "duty"

  # ===== require =====

  Scenario: Require sets a skill requirement on a position
    Given position "acme/cto" exists
    When I direct "!position.require" with:
      | position | acme/cto                      |
      | content  | Feature: System design skill  |
      | id       | system-design                 |
    Then the result process should be "require"
    And the result state name should be "requirement"

  # ===== appoint =====

  Scenario: Appoint assigns an individual to a position
    Given individual "sean" exists
    And "sean" is hired into "acme"
    And position "acme/cto" exists
    When I direct "!position.appoint" with:
      | position   | acme/cto |
      | individual | sean     |
    Then the result process should be "appoint"

  # ===== dismiss =====

  Scenario: Dismiss removes an individual from a position
    Given individual "sean" exists
    And "sean" is hired into "acme"
    And position "acme/cto" exists
    And "sean" is appointed to "acme/cto"
    When I direct "!position.dismiss" with:
      | position   | acme/cto |
      | individual | sean     |
    Then the result process should be "dismiss"

  # ===== abolish =====

  Scenario: Abolish archives a position
    Given position "acme/cto" exists
    When I direct "!position.abolish" with:
      | position | acme/cto |
    Then the result process should be "abolish"
    And the result state name should be "position"
