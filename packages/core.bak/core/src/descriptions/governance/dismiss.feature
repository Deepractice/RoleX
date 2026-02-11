Feature: dismiss
  Remove a role from a position.

  Scenario: Dismiss from position
    Given a role is assigned to a position
    When I call dismiss with the role name and position name
    Then the assignment is removed
    And the role remains a member of the organization
