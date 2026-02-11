Feature: explore
  As a role, I explore the RoleX world — discovering roles, organizations, and relationships.

  Scenario: Explore the world
    Given I have an active identity
    When I call explore without a name
    Then I see all roles and organizations in the RoleX world

  Scenario: Explore a specific entity
    Given I have an active identity
    When I call explore with a name
    Then I see detailed information about that role or organization
    And for roles: persona, knowledge counts, active goals
    And for organizations: charter and positions
