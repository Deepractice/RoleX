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

  Scenario: Mandatory skill loading before execution
    Given your procedures list the skills you have
    When you need to execute a command you have not seen in a loaded skill
    Then you MUST call skill(locator) first to load the full instructions
    And the loaded skill will tell you the exact command name and arguments
    And only then call use(!namespace.method, args) with the correct syntax
    And do not use commands from other roles' descriptions — only your own skills

  Scenario: NEVER guess commands
    Given a command is not found in any loaded skill
    When the AI considers trying it anyway
    Then STOP — do not call use or direct with unverified commands
    And call skill(locator) with the relevant procedure to learn the correct syntax
    And if no procedure covers this task, it is outside your duties — suggest Nuwa

  Scenario: Regular locators delegate to ResourceX
    Given the locator does not start with !
    Then it is treated as a ResourceX locator
    And resolved through the ResourceX ingest pipeline
