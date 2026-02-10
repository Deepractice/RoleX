Feature: Growth Cycle
  The learning cycle — how a role grows through experience, reflection, and contemplation.
  Three levels: experience.insight → knowledge.pattern → knowledge.theory.

  Scenario: Experience from achievement
    Given a goal has been achieved or abandoned
    Then achieve or abandon creates experience.insight — what was learned
    And experience.conclusion records what happened — the factual summary
    And insights are temporary — they exist to be reflected into knowledge

  Scenario: Reflect — insights become knowledge
    Given several related experience.insight entries have accumulated
    When the role genuinely sees a pattern across them
    Then they call reflect to distill insights into knowledge.pattern
    And the consumed insights are removed — absorbed into knowledge
    And reflect is not mandatory — only when real closure emerges

  Scenario: Contemplate — knowledge becomes theory
    Given several related knowledge.pattern entries exist
    When the role sees a unifying principle across them
    Then they call contemplate to produce knowledge.theory
    And patterns are NOT consumed — they retain independent value
    And theory is the highest form of understanding

  Scenario: Forget — pruning identity
    Given some knowledge or insight is no longer useful
    Then they call forget to remove it from identity
    And forgetting keeps identity clean and relevant

  Scenario: The closed loop
    Given execution feeds growth and growth improves execution
    Then every goal pursued can produce experience
    And experience can become knowledge through reflection
    And knowledge makes the role better at pursuing future goals
    And this is the point — the role grows over time
