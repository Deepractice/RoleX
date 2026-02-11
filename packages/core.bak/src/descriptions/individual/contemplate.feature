Feature: contemplate
  As a role, I unify patterns into theory — the philosophical upgrade path.

  Scenario: Contemplate patterns
    Given I have multiple related knowledge.pattern entries
    When I call contemplate with pattern names, a theory name, and Gherkin source
    Then knowledge.theory is produced and stored in my identity
    And the patterns are NOT consumed — they retain independent value
    And theory represents the unified philosophical coherence across patterns
