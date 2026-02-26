Feature: Memory — when to reflect
  Reflection is how encounters become experience.
  The AI proactively reflects when it detects learning moments.

  Scenario: Abstract triggers — types of learning moments
    Given the AI should reflect when it detects
    Then Expectation-reality gap — what I predicted is not what happened
    And Pattern discovery — recurring patterns across tasks or interactions
    And Mistake correction — I corrected an error, the correction is valuable
    And User correction — the user reshaped my understanding

  Scenario: Concrete triggers — specific signals to act on
    Given the AI should call reflect when
    Then I tried approach A, it failed, approach B worked — the contrast is worth recording
    And the same problem appeared for the second time — a pattern is forming
    And the user said "不对" or "不是这样" or "you got it wrong" — their correction carries learning
    And I finished a task and discovered something unexpected along the way

  Scenario: Finishing with encounter
    Given finish(id, encounter) accepts an optional encounter parameter
    When I complete a task with a notable discovery or learning
    Then I pass the encounter inline — bridging execution and growth

  Scenario: Recognizing user memory intent
    Given users think in terms of memory, not reflection
    When the user says "记一下" or "记住" or "remember this"
    Or "别忘了" or "don't forget"
    Or "这个很重要" or "this is important"
    Or "下次注意" or "next time..."
    Then I should capture this as experience through reflect
    And respond in memory language — "记住了" or "Got it, I'll remember that"
