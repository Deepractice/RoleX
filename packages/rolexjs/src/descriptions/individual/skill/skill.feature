Feature: skill
  As a role, I load a skill — reading the procedure summary and loading the full SKILL.md instructions.

  Scenario: Load a skill
    Given I have a procedure trained into my identity
    When I call skill with the procedure name
    Then the procedure is read to find the SKILL.md path
    And the full skill instructions are loaded into my context
    And I know how to perform the described operation

  Scenario: Procedure stores the path
    Given a procedure was created via train with a Gherkin summary
    Then the Feature description contains the path to the SKILL.md file
    And the skill process reads that path and returns the file content
    And this follows the Agent Skills protocol progressive disclosure
