Feature: realize — experience to principle
  Distill experience into a principle — a transferable piece of knowledge.
  Principles are general truths discovered through experience.

  Scenario: Realize a principle
    Given an experience exists from reflection
    When realize is called on the experience
    Then the experience is consumed
    And a principle is added to the role's knowledge
    And the principle represents transferable, reusable understanding
