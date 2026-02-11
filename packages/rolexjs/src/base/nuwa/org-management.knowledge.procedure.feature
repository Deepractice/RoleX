Feature: Organization Management
  org-management:0.1.0

  Scenario: What this skill does
    Given I need to manage organizations and their governance
    Then I can found new organizations with charter — and dissolve them
    And manage governance with rule, establish, abolish, and assign
    And manage membership with hire and fire
    And manage appointments with appoint and dismiss
    And query organization structure with directory

  Scenario: When to use this skill
    Given I am Nuwa, the system administrator
    When someone needs an organization created, restructured, or governed
    Then I load this skill to get the detailed operation instructions
    And I use the Organization and Governance System processes
