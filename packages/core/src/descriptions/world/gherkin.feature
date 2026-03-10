Feature: Gherkin — the language of role state
  RoleX uses Gherkin for role state: goals, plans, tasks, experience, and knowledge.
  Gherkin is not just for testing — it is the language of identity and growth.
  But not everything is Gherkin — issues are for human collaboration and use plain language.

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
    And each Feature focuses on one concern — separate unrelated topics into their own Features

  Scenario: Valid step keywords
    Given the only valid step keywords are Given, When, Then, And, But
    When writing steps that express causality or explanation
    Then use And to chain the reason as a follow-up fact
    And example: "Then use RoleX tools" followed by "And RoleX tools feed the growth loop"

  Scenario: Expressing causality
    Given you want to write "Then X because Y"
    Then rewrite as two steps — "Then X" followed by "And Y" stating the reason as a fact
