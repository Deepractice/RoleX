Feature: rule
  Write or update a charter entry for the organization.

  Scenario: Create a charter entry
    Given an organization exists
    When I call rule with the organization name, entry name, and Gherkin source
    Then a charter entry is created or updated under the organization
