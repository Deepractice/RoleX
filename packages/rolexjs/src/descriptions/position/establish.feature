Feature: establish — create a position
  Create a position as an independent entity.
  Positions define roles and can be charged with duties.

  Scenario: Establish a position
    Given a Gherkin source describing the position
    When establish is called with the position content
    Then a new position entity is created
    And the position can be charged with duties
    And individuals can be appointed to it

  Scenario: Writing the position Gherkin
    Given the position Feature describes a role
    Then the Feature title names the position
    And the description captures responsibilities, scope, and expectations
    And Scenarios are optional — use them for distinct aspects of the role
