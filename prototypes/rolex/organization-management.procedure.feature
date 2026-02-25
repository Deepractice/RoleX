Feature: Organization Management
  organization-management

  Scenario: When to use this skill
    Given I need to manage organizations (found, charter, dissolve)
    And I need to manage membership (hire, fire)
    When the operation involves creating, governing, or staffing organizations
    Then load this skill for detailed instructions
