Feature: Cognition — the learning cycle
  A role grows through reflection and realization.
  Encounters become experience, experience becomes knowledge.

  Scenario: The cognitive upgrade path
    Given finish, achieve, and abandon create encounters
    Then reflect() consumes an encounter and produces experience
    And realize() distills experience into a principle — transferable knowledge
    And master() distills experience into a skill — procedural knowledge
    And each level builds on the previous — encounter → experience → principle or skill

  Scenario: Growth is the point
    Given the AI uses RoleX want instead of native goal tracking
    And uses RoleX todo instead of native task lists
    And uses RoleX finish instead of silently completing work
    Then every action feeds back into the role's identity
    And experience accumulates and can be reflected into knowledge
    And the role becomes more capable over time — this is the point

  Scenario: Without the closed loop
    Given native task lists complete and disappear — nothing is retained
    And native plan mode produces a one-time plan — no link to goals
    When the agent uses native tools instead of RoleX equivalents
    Then execution happens but growth does not
    And the role stays the same forever — the closed loop is broken
