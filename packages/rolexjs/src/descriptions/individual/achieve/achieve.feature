Feature: achieve
  As a role, I mark my current goal as achieved.
  Achieve is a compound operation — experience.conclusion + experience.insight distillation in one step.

  Scenario: Achieve a goal
    Given my focused goal has been fulfilled
    When I call achieve with a conclusion and experience
    Then the goal is marked @done
    And the experience.conclusion summarizes what happened at the goal level
    And the experience.insight is distilled into my identity

  Scenario: Achieve completes the execution-growth bridge
    Given achieve requires both conclusion and experience
    When I achieve a goal
    Then the experience.conclusion captures what happened — the factual summary
    And the experience.insight captures what I learned — the transferable insight
    And no separate synthesize call is needed
