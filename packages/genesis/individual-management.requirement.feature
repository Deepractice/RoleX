Feature: Individual management skill required
  This position requires the ability to manage individuals —
  birth, retirement, knowledge injection, and identity management.

  Scenario: When this skill is needed
    Given the position involves creating or managing individuals
    When an individual is appointed to this position
    Then they must have the individual-management procedure
