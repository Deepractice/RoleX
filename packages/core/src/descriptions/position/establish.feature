Feature: establish — create a position
  Create a position in society.
  Positions define roles with duties and skill requirements.
  Individuals can be appointed to positions.

  Scenario: Establish a position
    Given a Gherkin source describing the position
    When establish is called with the source
    Then a new position node is created in society
    And the position can be charged with duties
    And skill requirements can be added
    And individuals can be appointed to it

  Scenario: Parameters
    Given the command is position.establish
    Then content is optional — Gherkin Feature describing the position
    And id is optional — kebab-case identifier (e.g. "cto")
    And alias is optional — alternative names

  Scenario: Writing the position Gherkin
    Given the position Feature describes a role
    Then the Feature title names the position
    And the description captures responsibilities, scope, and expectations
    And Scenarios are optional — use them for distinct aspects of the role
