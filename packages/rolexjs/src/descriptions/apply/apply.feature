Feature: apply
  As a role, I apply procedural knowledge — loading a skill's instructions.

  Scenario: Apply a procedure
    Given I have a procedure trained into my identity
    When I call apply with the procedure name
    Then the full procedural knowledge is loaded into my context
    And I know how to perform the described operation
