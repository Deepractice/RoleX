Feature: Prototype Management
  prototype-management

  Scenario: When to use this skill
    Given I need to manage prototypes (settle, evict)
    And I need to register or remove prototype packages
    When the operation involves prototype lifecycle or registry inspection
    Then load this skill for detailed instructions
