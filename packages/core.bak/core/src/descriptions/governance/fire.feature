Feature: fire
  Fire a role from an organization.

  Scenario: Remove a member
    Given a role is a member of an organization
    When I call fire with the organization name and role name
    Then the role is dismissed from all positions
    And the role is removed from the organization
