Feature: born — create a new individual
  Create a new individual with persona identity.
  The persona defines who the role is — personality, values, background.
  An identity node is automatically created under the individual.

  Scenario: Birth an individual
    Given a Gherkin source describing the persona
    When born is called with the source
    Then a new individual node is created in society
    And an identity child node is created automatically
    And the individual can be hired into organizations
    And the individual can be activated to start working

  Scenario: Parameters
    Given the command is individual.born
    Then content is optional — Gherkin Feature describing the persona
    And id is optional — kebab-case identifier (e.g. "sean")
    And alias is optional — alternative names (e.g. ["小明", "xm"])

  Scenario: Writing the individual Gherkin
    Given the individual Feature defines a persona — who this role is
    Then the Feature title names the individual
    And the description captures personality, values, expertise, and background
    And Scenarios are optional — use them for distinct aspects of the persona
