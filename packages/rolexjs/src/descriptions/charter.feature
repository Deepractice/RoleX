Feature: charter — define organizational charter
  Define the charter for an organization.
  The charter describes the organization's mission, principles, and governance rules.

  Scenario: Define a charter
    Given an organization exists
    And a Gherkin source describing the charter
    When charter is called on the organization
    Then the charter is stored as the organization's information

  Scenario: Writing the charter Gherkin
    Given the charter defines an organization's mission and governance
    Then the Feature title names the charter or the organization it governs
    And Scenarios describe principles, rules, or governance structures
    And the tone is declarative — stating what the organization stands for and how it operates
