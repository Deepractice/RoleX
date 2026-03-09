Feature: rehire — restore a retired individual
  Restore an individual from the past archive back to active society.
  All previous knowledge, experience, and history are intact.

  Scenario: Rehire an individual
    Given a retired individual exists in the past archive
    When rehire is called on the individual
    Then the individual is restored to active society
    And all previous data and knowledge are intact

  Scenario: Parameters
    Given the command is society.rehire
    Then individual is required — the archived individual's id
