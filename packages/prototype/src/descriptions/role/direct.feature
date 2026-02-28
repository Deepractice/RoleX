Feature: direct — stateless world-level executor
  Execute commands and load resources without an active role.
  Direct operates as an anonymous observer — no role identity, no role context.
  For operations as an active role, use the use tool instead.

  Scenario: When to use "direct" vs "use"
    Given no role is activated — I am an observer
    When I need to query or operate on the world
    Then direct is the right tool
    And once a role is activated, use the use tool for role-level actions

  Scenario: Execute a RoleX command
    Given the locator starts with `!`
    When direct is called with the locator and named args
    Then the command is parsed as `namespace.method`
    And dispatched to the corresponding RoleX API

  Scenario: Load a ResourceX resource
    Given the locator does not start with `!`
    When direct is called with the locator
    Then the locator is passed to ResourceX for resolution
    And the resource is loaded and returned
