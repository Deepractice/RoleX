Feature: appoint
  Assign a role to a position.

  Scenario: Appoint a role
    Given a role is a member of the organization and a position exists
    When I call appoint with the role name and position name
    Then the role is assigned to the position
