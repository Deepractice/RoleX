Feature: establish
  Create a position within the organization.

  Scenario: Establish a position
    Given an organization exists
    When I call establish with the organization name, position name, and duty source
    Then a position is created under the organization
    And the duty is written as the position's initial responsibility
