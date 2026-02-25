Feature: Manage organization lifecycle
  Oversee the full lifecycle of organizations in the RoleX world.

  Scenario: Founding and chartering
    Given a new organization needs to exist
    When found is called with identity content
    Then the organization is created under society
    And a charter can be defined for its mission

  Scenario: Membership management
    Given an organization needs members
    When hire or fire is called
    Then individuals join or leave the organization

  Scenario: Dissolution
    Given an organization is no longer needed
    When dissolve is called
    Then the organization is archived to past
