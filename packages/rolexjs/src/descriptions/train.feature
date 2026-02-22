Feature: train — inject external skill
  Directly inject a procedure (skill) into an individual.
  Unlike master which consumes experience, train requires no prior encounters.
  Use train to equip a role with a known, pre-existing skill.

  Scenario: Train a procedure
    Given an individual exists
    When train is called with individual id, procedure Gherkin, and a procedure id
    Then a procedure is created directly under the individual
    And no experience or encounter is consumed
    And if a procedure with the same id already exists, it is replaced

  Scenario: Procedure ID convention
    Given the id is keywords from the procedure content joined by hyphens
    Then "Skill Creator" becomes id "skill-creator"
    And "Role Management" becomes id "role-management"

  Scenario: When to use train vs master
    Given master distills internal experience into a procedure
    And train injects an external, pre-existing skill
    When a role needs a skill it has not learned through experience
    Then use train to equip the skill directly
    When a role has gained experience and wants to codify it
    Then use master to distill it into a procedure

  Scenario: Writing the procedure Gherkin
    Given the procedure is a skill reference — same format as master output
    Then the Feature title names the capability
    And the description includes the locator for full skill loading
    And Scenarios describe when and why to apply this skill
