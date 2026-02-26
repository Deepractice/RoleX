Feature: use — unified execution entry point
  Execute any RoleX command or load any ResourceX resource through a single entry point.
  The locator determines the dispatch path:
  - `!namespace.method` dispatches to the RoleX runtime
  - Any other locator delegates to ResourceX

  Scenario: Execute a RoleX command
    Given the locator starts with `!`
    When use is called with the locator and named args
    Then the command is parsed as `namespace.method`
    And dispatched to the corresponding RoleX API
    And the result is returned

  Scenario: Available namespaces
    Given the `!` prefix routes to RoleX namespaces
    Then `!individual.*` routes to individual lifecycle and injection
    And `!org.*` routes to organization management
    And `!position.*` routes to position management

  Scenario: Load a ResourceX resource
    Given the locator does not start with `!`
    When use is called with the locator
    Then the locator is passed to ResourceX for resolution
    And the resource is loaded and returned
