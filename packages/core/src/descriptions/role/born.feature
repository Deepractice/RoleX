Feature: born
  Create a new role with its persona identity.

  Scenario: Birth a role
    Given a role name and Gherkin persona source
    When I call born with the name and source
    Then a new role structure is created
    And the persona is written as identity
