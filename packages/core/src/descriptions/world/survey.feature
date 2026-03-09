Feature: Survey — world-level overview of what exists
  Survey is the top-level perception tool for seeing the entire world.
  It works without an active role — it is a stateless world query.

  Scenario: List everything
    Given the user asks "有哪些人" or "有哪些组织" or "list individuals"
    Or the user asks "世界里有什么" or "show me what exists"
    When I need to answer what exists in the RoleX world
    Then I call survey()
    And it returns all individuals, organizations, and positions

  Scenario: Filter by type
    Given I only need one category
    When I call survey(type: "individual")
    Then only individuals are returned
    And valid types are individual, organization, position

  Scenario: View archived entities
    Given I want to see retired, dissolved, or abolished entities
    When I call survey(type: "past")
    Then archived entities are returned

  Scenario: Help find the right person
    Given a user's request falls outside my duties
    When I need to suggest who can help
    Then call survey() to see available individuals and their positions
    And suggest the user activate the appropriate individual
    And if unsure who can help, suggest activating Nuwa
