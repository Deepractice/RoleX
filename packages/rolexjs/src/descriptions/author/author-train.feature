Feature: author-train — add a procedure to a prototype
  Add a procedure to an existing prototype directory.
  Updates individual.json manifest and writes a procedure feature file.

  Scenario: Add a procedure
    Given a prototype directory with individual.json exists
    And a Gherkin source describing the procedure
    When author-train is called with dir, content, and id
    Then the manifest's children gains a new entry with type "procedure"
    And a <id>.procedure.feature file is written to the directory

  Scenario: Procedure content
    Given a procedure is skill metadata pointing to full skill content
    Then the Feature title names the capability
    And the description includes the locator for full skill loading
    And Scenarios describe when and why to apply this skill
