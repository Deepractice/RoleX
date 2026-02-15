Feature: charter — define organizational charter
  Define the charter for an organization.
  The charter describes the organization's mission, principles, and governance rules.

  Scenario: Define a charter
    Given an organization exists
    And a Gherkin source describing the charter
    When charter is called on the organization
    Then the charter is stored as the organization's information
