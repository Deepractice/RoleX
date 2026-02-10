Feature: synthesize
  As a role, I turn encounters into experience — a posteriori learning.

  Scenario: Synthesize experience
    Given something noteworthy happened — a mistake, a pattern, a correction
    When I call synthesize with a name and Gherkin experience source
    Then the experience is stored in my identity
    And I can later reflect on it to produce knowledge
