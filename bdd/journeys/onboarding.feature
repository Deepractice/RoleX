@onboarding @npx
Feature: Onboarding via npx
  A new user installs @rolexjs/mcp-server via npx,
  connects an MCP client, and activates Nuwa.

  Scenario: npx starts MCP server and registers tools
    Given the MCP server is running via npx
    Then the following tools should be available:
      | tool     |
      | activate |
      | focus    |
      | want     |
      | plan     |
      | todo     |
      | finish   |
      | complete |
      | abandon  |
      | reflect  |
      | realize  |
      | master   |
      | forget   |
      | skill    |
      | use      |
      | direct   |

  Scenario: Activate Nuwa via npx
    Given the MCP server is running via npx
    When I call tool "activate" with:
      | roleId | nuwa |
    Then the tool result should contain "nuwa"
    And the tool result should contain "[individual]"
