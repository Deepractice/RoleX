Feature: Census — the only way to query what exists in the world
  Census is the single entry point for all world-level queries.
  Call it via the MCP direct tool: direct("!census.list").
  Census works without an active role — it is a stateless world query.

  Scenario: List everything
    Given the user asks "有哪些人" or "有哪些组织" or "list individuals"
    Or the user asks "世界里有什么" or "show me what exists"
    When I need to answer what exists in the RoleX world
    Then I call direct("!census.list")
    And it returns all individuals, organizations, and positions

  Scenario: Filter by type
    Given I only need one category
    When I call direct("!census.list", { type: "individual" })
    Then only individuals are returned
    And valid types are individual, organization, position

  Scenario: View archived entities
    Given I want to see retired, dissolved, or abolished entities
    When I call direct("!census.list", { type: "past" })
    Then archived entities are returned

  Scenario: Census before action
    Given I need to check existence before creating something
    When I want to found an org, born an individual, or establish a position
    Then call census.list first to avoid duplicates
