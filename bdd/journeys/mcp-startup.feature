@journey @mcp @startup
Feature: MCP Server Startup
  The MCP server is the entry point for all AI agent interactions.
  It must start reliably, register all tools, and respond to basic operations.

  Scenario: Server starts and registers all tools
    Given the MCP server is running
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

  Scenario: Activate a role through MCP
    Given the MCP server is running
    When I call tool "activate" with:
      | roleId | nuwa |
    Then the tool result should contain "nuwa"
    And the tool result should contain "[individual]"

  Scenario: Direct world query through MCP
    Given the MCP server is running
    When I call tool "direct" with:
      | locator | !census.list |
    Then the tool result should contain "nuwa"
