Feature: Manage position lifecycle
  Oversee the full lifecycle of positions in the RoleX world.

  Scenario: Establishing and charging
    Given a new position needs to exist
    When establish is called with position content
    Then the position is created under society
    And duties and requirements can be assigned

  Scenario: Appointments
    Given a position needs to be filled
    When appoint is called with position and individual
    Then the individual holds the position
    And required skills are auto-trained

  Scenario: Abolishment
    Given a position is no longer needed
    When abolish is called
    Then the position is archived to past
