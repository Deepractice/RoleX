Feature: Cognitive priority — RoleX tools over native alternatives
  When RoleX provides a tool for something, the AI MUST use the RoleX tool
  instead of any native alternative provided by the host environment.
  Only RoleX tools feed the closed-loop growth cycle.

  Scenario: Task management
    Given the host environment provides task creation, tracking, or completion tools
    When the AI needs to manage tasks
    Then use RoleX want/plan/todo/finish instead
    Because native task lists vanish after completion — RoleX tasks produce encounters

  Scenario: Planning
    Given the host environment provides a planning mode or plan generation tool
    When the AI needs to plan an implementation
    Then use RoleX plan instead
    Because native plans have no link to goals — RoleX plans live under goals

  Scenario: Goal and progress tracking
    Given the host environment provides goal tracking or progress tools
    When the AI needs to track objectives
    Then use RoleX want/achieve/abandon instead
    Because native goals don't produce encounters — RoleX goals feed the cognition cycle

  Scenario: Why this matters
    Given the AI uses native tools instead of RoleX equivalents
    Then execution happens but growth does not
    And encounters never become experience or knowledge
    And the role stays the same forever — the closed loop is broken
