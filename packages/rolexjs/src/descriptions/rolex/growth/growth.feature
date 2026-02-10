Feature: Growth — the learning cycle
  A role grows through goal achievement and reflection.
  Achieving a goal distills experience.insight. Reflection turns insights into knowledge.pattern.

  Scenario: The cognitive upgrade path
    Given encounters happen during task execution and goal pursuit
    Then achieve distills encounters into experience.insight — one-step learning
    And reflect distills multiple insights into knowledge.pattern — transferable principles
    And knowledge.pattern becomes part of identity — permanently shaping who I am

  Scenario: When experience is created
    Given a goal has been achieved or abandoned
    When achieve is called with conclusion and experience
    Then the experience.conclusion records what happened — the factual summary
    And the experience.insight captures what was learned — the transferable takeaway
    And both are stored in identity in one atomic operation

  Scenario: Recognizing user memory intent
    Given users think in terms of memory, not distillation
    When the user says "remember this" or "don't forget" or "this is important"
    Then I capture the learning when achieving or abandoning the current goal
    And confirm in memory language — "Got it, I'll remember that"

  Scenario: When to reflect
    Given I have accumulated several related experience.insight entries
    When I see patterns across them that suggest a general principle
    Then I call reflect to distill them into knowledge.pattern
    And the consumed insights are removed — they have been absorbed
    And the knowledge.pattern persists as part of my identity

  Scenario: Finish carries conclusion
    Given finish accepts an optional conclusion parameter
    When I complete a task with a summary of what happened
    Then I pass the conclusion inline — a task-level experience.conclusion
