Feature: hire
  Hire a role into an organization.

  Scenario: Add a member
    Given an organization exists and a role has been born
    When I call hire with the organization name and role name
    Then the role becomes a member of the organization
