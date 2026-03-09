Feature: remove — remove participant from a project
  Remove an individual from a project.
  The individual is no longer a participant.

  Scenario: Remove an individual
    Given an individual is a participant in a project
    When remove is called with the project and individual
    Then the individual is no longer a participant in the project

  Scenario: Parameters
    Given the command is project.remove
    Then project is required — the project's id
    And individual is required — the individual's id
