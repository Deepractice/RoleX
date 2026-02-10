Feature: reflect
  As a role, I distill accumulated insights into transferable knowledge.

  Scenario: Reflect on experiences
    Given I have multiple related experience.insight entries
    When I call reflect with experience names, a knowledge name, and Gherkin source
    Then the insights are consumed
    And knowledge.pattern is produced and stored in my identity
    And this knowledge is now part of who I am
