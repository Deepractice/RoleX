Feature: found — create a new organization
  Found a new organization in society.
  Organizations group individuals and define positions.

  Scenario: Found an organization
    Given a Gherkin source describing the organization
    When found is called with the source
    Then a new organization node is created in society
    And positions can be established within it
    And a charter can be defined for it
    And individuals can be hired into it

  Scenario: Parameters
    Given the command is org.found
    Then content is optional — Gherkin Feature describing the organization
    And id is optional — kebab-case identifier (e.g. "deepractice")
    And alias is optional — alternative names

  Scenario: Writing the organization Gherkin
    Given the organization Feature describes the group's purpose and structure
    Then the Feature title names the organization
    And the description captures mission, domain, and scope
    And Scenarios are optional — use them for distinct organizational concerns
