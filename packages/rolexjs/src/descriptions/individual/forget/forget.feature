Feature: forget
  As a role, I forget information — removing knowledge, experience, or procedure from my identity.

  Scenario: Forget information
    Given I have knowledge.pattern, knowledge.procedure, knowledge.theory, or experience.insight in my identity
    When I call forget with the type and name
    Then the information is removed from my identity
    And I no longer carry that knowledge, experience, or skill
