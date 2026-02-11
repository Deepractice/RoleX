Feature: found
  Found a new organization.

  Scenario: Create an organization
    Given an organization name
    When I call found with the name
    Then a new organization structure is created
    And roles can be hired into it via governance
