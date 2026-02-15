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
