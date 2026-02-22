Feature: die — permanently remove an individual
  Permanently remove an individual.
  Unlike retire, this is irreversible.

  Scenario: Remove an individual permanently
    Given an individual exists
    When die is called on the individual
    Then the individual and all associated data are removed
    And this operation is irreversible
