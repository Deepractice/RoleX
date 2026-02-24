Feature: author-teach — add a principle to a prototype
  Add a principle to an existing prototype directory.
  Updates individual.json manifest and writes a principle feature file.

  Scenario: Add a principle
    Given a prototype directory with individual.json exists
    And a Gherkin source describing the principle
    When author-teach is called with dir, content, and id
    Then the manifest's children gains a new entry with type "principle"
    And a <id>.principle.feature file is written to the directory

  Scenario: Principle content
    Given a principle is a transferable truth
    Then the Feature title states the principle as a general rule
    And Scenarios describe situations where this principle applies
