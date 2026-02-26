Feature: Gherkin — the universal language
  Everything in RoleX is expressed as Gherkin Feature files.
  Gherkin is not just for testing — it is the language of identity, goals, and knowledge.

  Scenario: Feature and Scenario convention
    Given RoleX uses Gherkin to represent goals, plans, tasks, experience, and knowledge
    Then a Feature represents one independent concern — one topic, explained fully
    And Scenarios represent different situations or conditions within that concern
    And Given/When/Then provides narrative structure within each scenario

  Scenario: Writing Gherkin for RoleX
    Given the AI creates goals, plans, tasks, and experiences as Gherkin
    Then keep it descriptive and meaningful — living documentation, not test boilerplate
    And use Feature as the title — what this concern is about
    And use Scenario for specific situations within that concern
    And do not mix unrelated concerns into one Feature

  Scenario: Valid step keywords
    Given the only valid step keywords are Given, When, Then, And, But
    When writing steps that express causality or explanation
    Then never invent keywords like Because, Since, or So

  Scenario: Expressing causality without Because
    Given you want to write "Then X because Y"
    Then rewrite as two steps — "Then X" followed by "And Y" stating the reason as a fact
    And example — instead of "Then use RoleX tools because native tools break the loop"
    And write "Then use RoleX tools" followed by "And native tools do not feed the growth loop"
