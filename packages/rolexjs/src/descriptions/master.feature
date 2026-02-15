Feature: master — experience to skill
  Distill experience into a skill — procedural knowledge.
  Skills represent learned capabilities.

  Scenario: Master a skill
    Given an experience exists from reflection
    When master is called on the experience
    Then the experience is consumed
    And a skill is added to the role's knowledge
    And the skill represents a learned procedural capability
