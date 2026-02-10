Feature: forget
  As a role, I forget information — removing knowledge, experience, or procedure from my identity.

  Scenario: Forget information
    Given I have knowledge, experience, or procedure in my identity
    When I call forget with the type and name
    Then the information is removed from my identity
    And I no longer carry that knowledge, experience, or skill
