Feature: archive — archive a project
  Move a project to the past archive.
  The project and its subtree (scope, milestones, deliverables, wiki) are preserved.

  Scenario: Archive a project
    Given a project exists in society
    When archive is called on the project
    Then the project is moved to the past archive
    And the project's subtree is preserved in past

  Scenario: Parameters
    Given the command is org.archive
    Then project is required — the project's id
