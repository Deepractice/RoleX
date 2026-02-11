Feature: train
  Train a role with procedural knowledge — skills and workflows.

  Scenario: Train a skill
    Given a role exists
    When I call train with a procedure name and Gherkin source
    Then the procedure is written to the role's identity
    And the Feature description should contain the path to the SKILL.md file
    And identity will show the procedure summary
    And skill will load the full SKILL.md instructions
