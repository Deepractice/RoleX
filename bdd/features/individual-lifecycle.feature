@individual
Feature: Individual lifecycle
  Birth, retirement, death, rehire, and knowledge injection.

  Background:
    Given a fresh Rolex instance

  # ===== born =====

  Scenario: Born creates an individual
    When I direct "!individual.born" with:
      | content | Feature: Sean |
      | id      | sean          |
    Then the result process should be "born"
    And the result state name should be "individual"
    And the result state id should be "sean"
    And individual "sean" should exist

  # ===== retire =====

  Scenario: Retire archives an individual
    Given individual "sean" exists
    When I direct "!individual.retire" with:
      | individual | sean |
    Then the result process should be "retire"
    And the result state name should be "individual"

  # ===== die =====

  Scenario: Die permanently removes an individual
    Given individual "sean" exists
    When I direct "!individual.die" with:
      | individual | sean |
    Then the result process should be "die"
    And the result state name should be "individual"

  # ===== rehire =====

  Scenario: Rehire brings back a retired individual
    Given individual "sean" exists
    And individual "sean" is retired
    When I direct "!individual.rehire" with:
      | individual | sean |
    Then the result process should be "rehire"
    And the result state name should be "individual"

  # ===== teach =====

  Scenario: Teach injects a principle
    Given individual "sean" exists
    When I direct "!individual.teach" with:
      | individual | sean                       |
      | content    | Feature: Always test first |
      | id         | test-first                 |
    Then the result process should be "teach"
    And the result state name should be "principle"
    And the result state id should be "test-first"

  # ===== train =====

  Scenario: Train injects a procedure
    Given individual "sean" exists
    When I direct "!individual.train" with:
      | individual | sean                       |
      | content    | Feature: Code review skill |
      | id         | code-review                |
    Then the result process should be "train"
    And the result state name should be "procedure"
    And the result state id should be "code-review"
