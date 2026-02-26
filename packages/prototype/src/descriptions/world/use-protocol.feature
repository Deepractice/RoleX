Feature: Use tool — the universal execution entry point
  The MCP use tool is how you execute ALL RoleX operations beyond the core MCP tools.
  Whenever you see use("...") or a !namespace.method pattern in skills or documentation,
  it is an instruction to call the MCP use tool with that locator.

  Scenario: How to read use instructions in skills
    Given a skill document contains use("!resource.add", { path: "..." })
    Then this means: call the MCP use tool with locator "!resource.add" and args { path: "..." }
    And do NOT run CLI commands or Bash scripts — use the MCP use tool directly
    And this applies to every use("...") pattern you encounter in any skill or documentation

  Scenario: ! prefix dispatches to RoleX runtime
    Given the locator starts with !
    Then it is parsed as !namespace.method
    And dispatched to the corresponding RoleX API with named args
    And available namespaces include individual, org, position, prototype, census, and resource
    And examples: !prototype.found, !resource.add, !org.hire, !census.list

  Scenario: Regular locators delegate to ResourceX
    Given the locator does not start with !
    Then it is treated as a ResourceX locator
    And resolved through the ResourceX ingest pipeline

  Scenario: use covers everything — no need for CLI or Bash
    Given use can execute any RoleX namespace operation
    And use can load any ResourceX resource
    When you need to perform a RoleX operation
    Then always use the MCP use tool
    And never fall back to CLI commands for operations that use can handle
