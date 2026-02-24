Feature: author-born — create a prototype directory
  Create a new prototype role on the filesystem.
  Writes individual.json manifest and optional feature file.

  Scenario: Create a prototype directory
    Given a directory path and a prototype id
    When author-born is called with dir, id, and optional content and alias
    Then the directory is created (recursively if needed)
    And individual.json manifest is written with type "individual" and identity child
    And if content is provided, a <id>.individual.feature file is written
    And if alias is provided, it is included in the manifest

  Scenario: Writing the Gherkin content
    Given the content parameter accepts a Gherkin Feature source
    Then the Feature title names the role
    And Scenarios describe the role's identity, purpose, or characteristics
    And the content is written as-is to the feature file
