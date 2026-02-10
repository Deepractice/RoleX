Feature: reflect
  As a role, I distill accumulated experiences into transferable knowledge.

  Scenario: Reflect on experiences
    Given I have multiple related experiences
    When I call reflect with experience names, a knowledge name, and Gherkin source
    Then the experiences are consumed
    And knowledge is produced and stored in my identity
    And this knowledge is now part of who I am
