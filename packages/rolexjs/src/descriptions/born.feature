Feature: born — create a new individual
  Create a new individual with persona identity.
  The persona defines who the role is — personality, values, background.

  Scenario: Birth an individual
    Given a Gherkin source describing the persona
    When born is called with the source
    Then a new individual node is created in society
    And the persona is stored as the individual's information
    And the individual can be hired into organizations
    And the individual can be activated to start working
