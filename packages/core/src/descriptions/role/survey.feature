Feature: survey — world-level overview
  List all entities in the world: individuals, organizations, positions.
  Works without an active role — a stateless world query.

  Scenario: Survey the world
    When survey is called without arguments
    Then all individuals, organizations, and positions are returned

  Scenario: Filter by type
    When survey is called with a type parameter
    Then only entities of that type are returned
    And valid types are individual, organization, position, past
