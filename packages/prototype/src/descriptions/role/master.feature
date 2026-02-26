Feature: master — self-mastery of a procedure
  The role masters a procedure through its own agency.
  This is an act of self-growth — the role decides to acquire or codify a skill.
  Experience can be consumed as the source, or the role can master directly from external information.

  Scenario: Master from experience
    Given an experience exists from reflection
    When master is called with experience ids
    Then the experience is consumed
    And a procedure is created under the individual

  Scenario: Master directly
    Given the role encounters external information worth mastering
    When master is called without experience ids
    Then a procedure is created under the individual
    And no experience is consumed

  Scenario: Procedure ID convention
    Given the id is keywords from the procedure content joined by hyphens
    Then "JWT mastery" becomes id "jwt-mastery"
    And "Cross-package refactoring" becomes id "cross-package-refactoring"

  Scenario: Writing the procedure Gherkin
    Given a procedure is skill metadata — a reference to full skill content
    Then the Feature title names the capability
    And the description includes the locator for full skill loading
    And Scenarios describe when and why to apply this skill
    And the tone is referential — pointing to the full skill, not containing it
