Feature: rehire — restore a retired individual
  Rehire a retired individual.
  Restores the individual with full history and knowledge intact.

  Scenario: Rehire an individual
    Given a retired individual exists
    When rehire is called on the individual
    Then the individual is restored to active status
    And all previous data and knowledge are intact
