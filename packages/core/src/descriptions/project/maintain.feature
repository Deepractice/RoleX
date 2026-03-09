Feature: maintain — set project maintainer
  Assign a maintainer to a project.
  Maintainers can manage scope, milestones, participants, deliverables, and wiki.

  Scenario: Set a maintainer
    Given an individual and a project exist
    When maintain is called with the project and individual
    Then the individual becomes a maintainer of the project
    And the individual can manage the project's internal operations

  Scenario: Parameters
    Given the command is project.maintain
    Then project is required — the project's id
    And individual is required — the individual's id
