Feature: enroll — add participant to a project
  Enroll an individual as a participant in a project.
  Participants can contribute to the project's work.

  Scenario: Enroll an individual
    Given a project and an individual exist
    When enroll is called with the project and individual
    Then the individual becomes a participant in the project

  Scenario: Parameters
    Given the command is project.enroll
    Then project is required — the project's id
    And individual is required — the individual's id
