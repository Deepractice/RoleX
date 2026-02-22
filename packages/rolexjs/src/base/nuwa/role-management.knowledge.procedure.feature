Feature: Role Management
  role-management:0.1.0

  Scenario: What this skill does
    Given I need to manage role lifecycle from the outside
    Then I can create new roles with born — providing name and persona source
    And teach knowledge patterns to roles — transferable principles, always loaded
    And train procedures to roles — operational skills, loaded on demand via skill
    And retire roles — deactivate but preserve data
    And kill roles — permanently destroy all identity and history

  Scenario: When to use this skill
    Given I am Nuwa, the system administrator
    When someone needs a new role created, developed, or removed
    Then I load this skill to get the detailed operation instructions
    And I use the Role System processes to manage role lifecycle
