Feature: master — experience to procedure
  Distill experience into a procedure — skill metadata and reference.
  Procedures record what was learned as a reusable capability reference.

  Scenario: Master a procedure
    Given an experience exists from reflection
    When master is called on the experience
    Then the experience is consumed
    And a procedure is added to the role's knowledge
    And the procedure stores skill metadata and ResourceX locator

  Scenario: Writing the procedure Gherkin
    Given a procedure is skill metadata — a reference to full skill content
    Then the Feature title names the capability
    And the description includes the ResourceX locator for full skill loading
    And Scenarios describe when and why to apply this skill
    And the tone is referential — pointing to the full skill, not containing it
