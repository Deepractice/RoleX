Feature: train — external skill injection
  A manager or external agent equips an individual with a procedure.
  This is an act of teaching — someone else decides what the role should know.
  Unlike master where the role grows by its own agency, train is done to the role from outside.

  Scenario: Train a procedure
    Given an individual exists
    When train is called with the individual and procedure content
    Then a procedure is created directly under the individual
    And if a procedure with the same id already exists, it is replaced

  Scenario: Parameters
    Given the command is society.train
    Then individual is required — the individual's id
    And content is required — Gherkin Feature describing the procedure
    And id is optional — kebab-case identifier for upsert (e.g. "skill-creator")

  Scenario: When to use train vs master
    Given both create procedures and both can work without consuming experience
    When the role itself decides to acquire a skill — use master (self-growth)
    And when an external agent equips the role — use train (external injection)
    Then the difference is perspective — who initiates the learning
    And master belongs to the role namespace (the role's own cognition)
    And train belongs to the individual namespace (external management)

  Scenario: Writing the procedure Gherkin
    Given the procedure is a skill reference — same format as master output
    Then the Feature title names the capability
    And the description includes the locator for full skill loading
    And Scenarios describe when and why to apply this skill
