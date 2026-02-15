Feature: master — experience to skill
  Distill experience into a skill — procedural knowledge.
  Skills represent learned capabilities.

  Scenario: Master a skill
    Given an experience exists from reflection
    When master is called on the experience
    Then the experience is consumed
    And a skill is added to the role's knowledge
    And the skill represents a learned procedural capability

  Scenario: Writing the skill Gherkin
    Given a skill is procedural knowledge — how to do something
    Then the Feature title names the capability as an actionable procedure
    And Scenarios describe concrete steps or different situations for applying the skill
    And the tone is instructional — someone reading it can follow the steps
