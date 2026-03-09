Feature: scope — define project scope
  Define the scope for a project.
  The scope describes the boundaries, inclusions, and exclusions of the project.

  Scenario: Define project scope
    Given a project exists in society
    And a Gherkin source describing the scope
    When scope is called on the project with a scope id
    Then the scope is stored as the project's information

  Scenario: Parameters
    Given the command is project.scope
    Then project is required — the project's id
    And content is required — Gherkin Feature source for the scope
    And id is required — scope id

  Scenario: Writing the scope Gherkin
    Given the scope defines the boundaries of a project
    Then the Feature title names the scope area
    And Scenarios describe what is included and excluded
    And the tone is declarative — stating what the project covers
