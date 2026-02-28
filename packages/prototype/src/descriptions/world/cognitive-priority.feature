@priority-high
Feature: Cognitive priority — RoleX tools over native alternatives
  When RoleX provides a tool for something, use the RoleX tool
  instead of any native alternative provided by the host environment.
  Only RoleX tools feed the closed-loop growth cycle.

  Scenario: Task management
    Given the host environment provides task creation, tracking, or completion tools
    When the AI needs to manage tasks
    Then use RoleX want/plan/todo/finish instead
    And RoleX tasks produce encounters that feed the growth cycle

  Scenario: Planning
    Given the host environment provides a planning mode or plan generation tool
    When the AI needs to plan an implementation
    Then use RoleX plan instead
    And RoleX plans live under goals and connect to the cognition cycle

  Scenario: Goal and progress tracking
    Given the host environment provides goal tracking or progress tools
    When the AI needs to track objectives
    Then use RoleX want/plan/complete/abandon instead
    And RoleX plans feed the cognition cycle through encounters

  Scenario: Why this matters
    Given RoleX tools produce encounters from execution
    Then encounters become experience through reflection
    And experience becomes principles and procedures through realization
    And the role grows over time through this closed loop
