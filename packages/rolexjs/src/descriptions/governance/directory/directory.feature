Feature: directory
  Show the organization directory — members and positions.

  Scenario: List directory
    Given an organization exists
    When I call directory with the organization name
    Then I see all members and their position assignments
    And I see all positions and their duties
