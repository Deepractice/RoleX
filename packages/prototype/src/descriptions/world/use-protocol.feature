Feature: Use tool — the universal execution entry point
  The MCP use tool is how you execute ALL RoleX operations beyond the core MCP tools.
  Whenever you see use("...") or a !namespace.method pattern in skills or documentation,
  it is an instruction to call the MCP use tool with that locator.

  Scenario: How to read use instructions in skills
    Given a skill document contains use("!resource.add", { path: "..." })
    Then this means: call the MCP use tool with locator "!resource.add" and args { path: "..." }
    And always use the MCP use tool for RoleX operations
    And this applies to every use("...") pattern you encounter in any skill or documentation

  Scenario: ! prefix dispatches to RoleX runtime
    Given the locator starts with !
    Then it is parsed as !namespace.method
    And dispatched to the corresponding RoleX API with named args

  Scenario: Discovering available commands
    Given available commands are documented in world descriptions and skills
    When you need to perform an operation
    Then look up the correct command from world descriptions or loaded skills first
    And use only commands you have seen documented

  Scenario: NEVER guess commands
    Given a command is not found in any loaded skill or world description
    When the AI considers trying it anyway
    Then STOP — do not call use or direct with unverified commands
    And guessing wastes tokens, triggers errors, and erodes trust
    And instead ask the user or load the relevant skill first
    And there is no fallback — unknown commands simply do not exist

  Scenario: Regular locators delegate to ResourceX
    Given the locator does not start with !
    Then it is treated as a ResourceX locator
    And resolved through the ResourceX ingest pipeline
