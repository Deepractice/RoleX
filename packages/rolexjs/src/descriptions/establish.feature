Feature: establish — create a position
  Create a position within an organization.
  Positions define roles within the org and can be charged with duties.

  Scenario: Establish a position
    Given an organization exists
    And a Gherkin source describing the position
    When establish is called on the organization
    Then a new position node is created under the organization
    And the position can be charged with duties
    And members can be appointed to it

  Scenario: Writing the position Gherkin
    Given the position Feature describes a role within an organization
    Then the Feature title names the position
    And the description captures responsibilities, scope, and expectations
    And Scenarios are optional — use them for distinct aspects of the role
