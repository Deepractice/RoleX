Feature: direct — world-level command executor
  Execute RoleX world commands without an active role.
  Direct operates as an anonymous observer — no role identity, no role context.
  Use for administrative operations like society.born, org.hire, etc.

  Scenario: Execute a world command
    Given the command follows the namespace.method pattern
    When direct is called with the command and named args
    Then the command is dispatched to the corresponding RoleX API
    And the result is returned
