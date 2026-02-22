Feature: realize — experience to principle
  Distill experience into a principle — a transferable piece of knowledge.
  Principles are general truths discovered through experience.

  Scenario: Realize a principle
    Given an experience exists from reflection
    When realize is called with experience ids and a principle id
    Then the experience is consumed
    And a principle is added to the role's knowledge
    And the principle represents transferable, reusable understanding

  Scenario: Principle ID convention
    Given the id is keywords from the principle content joined by hyphens
    Then "Always validate expiry" becomes id "always-validate-expiry"
    And "Structure first design amplifies extensibility" becomes id "structure-first-design-amplifies-extensibility"

  Scenario: Writing the principle Gherkin
    Given a principle is a transferable truth — applicable beyond the original context
    Then the Feature title states the principle as a general rule
    And Scenarios describe different situations where this principle applies
    And the tone is universal — no mention of specific projects, tasks, or people
