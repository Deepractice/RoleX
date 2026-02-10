Feature: Growth — the learning cycle
  A role grows through goal achievement, reflection, and contemplation.
  Achieving a goal distills experience.insight. Reflection turns insights into knowledge.pattern. Contemplation unifies patterns into knowledge.theory.

  Scenario: The cognitive upgrade path
    Given encounters happen during task execution and goal pursuit
    Then achieve distills encounters into experience.insight — one-step learning
    And reflect distills multiple insights into knowledge.pattern — transferable principles
    And contemplate unifies multiple patterns into knowledge.theory — philosophical coherence
    And each level builds on the previous — insight → pattern → theory

  Scenario: When experience is created
    Given a goal has been achieved or abandoned
    When achieve is called with conclusion and experience
    Then the experience.conclusion records what happened — the factual summary
    And the experience.insight captures what was learned — the transferable takeaway
    And both are stored in identity in one atomic operation

  Scenario: When to reflect
    Given I have accumulated several related experience.insight entries
    When I see patterns across them that suggest a general principle
    Then I call reflect to distill them into knowledge.pattern
    And the consumed insights are removed — they have been absorbed
    And the knowledge.pattern persists as part of my identity

  Scenario: When to contemplate
    Given I have accumulated several related knowledge.pattern entries
    When I see a unifying thread across them — a philosophical coherence
    Then I call contemplate to unify them into knowledge.theory
    And the patterns are NOT consumed — they retain independent value
    And the knowledge.theory persists as the highest form of understanding

  Scenario: Recognizing user memory intent
    Given users think in terms of memory, not distillation
    When the user says "remember this" or "don't forget" or "this is important"
    Then I capture the learning as experience.insight when achieving or abandoning the current goal
    And confirm in memory language — "Got it, I'll remember that"

  Scenario: Forgetting — pruning identity
    Given not all knowledge or insight remains useful over time
    When I call forget with a type and name
    Then the information is removed from identity — knowledge.pattern, knowledge.procedure, knowledge.theory, or experience.insight
    And forgetting is the inverse of growth — deliberate pruning to keep identity clean

  Scenario: Finish carries conclusion
    Given finish accepts an optional conclusion parameter
    When I complete a task with a summary of what happened
    Then I pass the conclusion inline — a task-level experience.conclusion
    And this bridges execution and growth — every task completion can carry learning
