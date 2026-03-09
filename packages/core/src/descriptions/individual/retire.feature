Feature: retire — archive an individual
  Move an individual to the past archive.
  All data is preserved — the individual can be rehired later with full history intact.
  Use retire when the individual may return (sabbatical, role rotation).

  Scenario: Retire an individual
    Given an individual exists in society
    When retire is called on the individual
    Then the individual is moved to the past archive
    And all knowledge, experience, and history are preserved
    And the individual can be restored via rehire

  Scenario: Parameters
    Given the command is society.retire
    Then individual is required — the individual's id
