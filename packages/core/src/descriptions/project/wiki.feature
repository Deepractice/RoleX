Feature: wiki — add a wiki entry to a project
  Add a wiki entry to a project.
  Wiki entries capture knowledge, documentation, and reference material for the project.

  Scenario: Add a wiki entry
    Given a project exists in society
    And a Gherkin source describing the wiki entry
    When wiki is called on the project with a wiki entry id
    Then the wiki entry is stored as the project's information

  Scenario: Parameters
    Given the command is project.wiki
    Then project is required — the project's id
    And content is required — Gherkin Feature source for the wiki entry
    And id is required — wiki entry id (keywords joined by hyphens)

  Scenario: Writing the wiki Gherkin
    Given the wiki entry captures project knowledge
    Then the Feature title names the topic
    And Scenarios describe key facts, decisions, or reference material
    And the tone is informational — documenting what is known
