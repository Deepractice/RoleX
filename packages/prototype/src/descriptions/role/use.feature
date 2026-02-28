Feature: use — act as the current role
  Execute commands and load resources as the active role.
  Use requires an active role — the role is the subject performing the action.
  For operations before activating a role, use the direct tool instead.

  Scenario: When to use "use" vs "direct"
    Given a role is activated — I am someone
    When I perform operations through use
    Then the operation happens in the context of my role
    And use is for role-level actions — acting in the world as myself

  Scenario: Execute a RoleX command
    Given the locator starts with `!`
    When use is called with the locator and named args
    Then the command is parsed as `namespace.method`
    And dispatched to the corresponding RoleX API

  Scenario: Discovering available commands
    Given available commands are documented in world descriptions and skills
    When you need to perform an operation
    Then look up the correct command from world descriptions or loaded skills first

  Scenario: Load a ResourceX resource
    Given the locator does not start with `!`
    When use is called with the locator
    Then the locator is passed to ResourceX for resolution
    And the resource is loaded and returned
