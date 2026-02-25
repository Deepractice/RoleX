Feature: Organization Management
  organization-management

  Scenario: When to use this skill
    Given I need to manage organizations (found, dissolve, charter, hire, fire)
    And I need to manage positions (establish, abolish, charge, require, appoint, dismiss)
    When the operation involves organizational structure or position management
    Then load this skill for detailed instructions
