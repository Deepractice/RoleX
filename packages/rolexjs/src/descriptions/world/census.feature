Feature: Census — society-level queries
  Query the RoleX world to see what exists — individuals, organizations, positions.
  Census is read-only and accessed via the use tool with !census.list.

  Scenario: List all top-level entities
    Given I want to see what exists in the world
    When I call use("!census.list")
    Then I get a summary of all individuals, organizations, and positions
    And each entry includes id, name, and tag if present

  Scenario: Filter by type
    Given I only want to see entities of a specific type
    When I call use("!census.list", { type: "individual" })
    Then only individuals are returned
    And valid types are individual, organization, position

  Scenario: View archived entities
    Given I want to see what has been retired, dissolved, or abolished
    When I call use("!census.list", { type: "past" })
    Then entities in the archive are returned

  Scenario: When to use census
    Given I need to know what exists before acting
    When I want to check if an organization exists before founding
    Or I want to see all individuals before hiring
    Or I want an overview of the world
    Then census.list is the right tool
