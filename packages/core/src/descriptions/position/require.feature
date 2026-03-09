Feature: require — add skill requirement to a position
  Add a skill requirement to a position.
  Requirements describe the skills and qualifications needed for a position.

  Scenario: Require a skill for a position
    Given a position exists in society
    And a Gherkin source describing the skill requirement
    When require is called on the position with a requirement id
    Then the requirement is stored as the position's information
    And individuals appointed to this position are expected to meet the requirement

  Scenario: Parameters
    Given the command is position.require
    Then position is required — the position's id
    And content is required — Gherkin Feature source for the skill requirement
    And id is required — requirement id (keywords joined by hyphens)

  Scenario: Writing the requirement Gherkin
    Given the requirement defines skills needed for a position
    Then the Feature title names the skill or qualification
    And Scenarios describe specific competencies, experience levels, or certifications
    And the tone is descriptive — what the candidate should know or be able to do
