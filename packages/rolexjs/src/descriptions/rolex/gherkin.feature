Feature: Gherkin — the universal language
  Everything in Rolex is expressed as Gherkin Feature files.
  Gherkin is not just for testing — it is the language of identity, goals, and knowledge.

  Scenario: One format for everything
    Given Rolex needs to represent personas, knowledge, goals, plans, tasks, and experience
    Then all of these are Gherkin Feature files
    And Feature.type distinguishes them — persona, knowledge, procedure, experience, goal, plan, task
    And Scenario is the atomic unit of meaning within each Feature

  Scenario: Why Gherkin
    Given we need a format that is structured yet human-readable
    Then Gherkin provides Given/When/Then — natural language with structure
    And it is parseable by machines — one parser for all content
    And it supports tags for metadata — @done, @abandoned, @testable
    And it is already an open standard with broad tooling support

  Scenario: Writing Gherkin for Rolex
    Given the AI needs to create goals, plans, tasks, and experiences
    When writing Gherkin source for any Rolex operation
    Then use Feature as the title — what this is about
    And use Scenario to describe specific situations or aspects
    And use Given/When/Then for the narrative within each scenario
    And keep it descriptive and meaningful — this is living documentation, not test boilerplate
