Feature: Position management skill required
  This position requires the ability to manage positions —
  establishing, charging duties, requiring skills, and appointing individuals.

  Scenario: When this skill is needed
    Given the position involves creating or managing positions
    When an individual is appointed to this position
    Then they must have the position-management procedure
