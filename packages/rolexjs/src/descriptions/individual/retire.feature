Feature: retire — archive an individual
  Archive an individual — deactivate but preserve all data.
  A retired individual can be rehired later with full history intact.

  Scenario: Retire an individual
    Given an individual exists
    When retire is called on the individual
    Then the individual is deactivated
    And all data is preserved for potential restoration
    And the individual can be rehired later
