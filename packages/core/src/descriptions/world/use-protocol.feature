Feature: Use tool — the universal execution entry point
  The MCP use tool is how you execute ALL RoleX commands beyond the core MCP tools.
  Commands follow the !namespace.method pattern and are dispatched to the RoleX runtime.
  See command-system for the full command reference.

  Scenario: ! prefix dispatches to RoleX runtime
    Given the command starts with !
    Then it is parsed as !namespace.method
    And dispatched to the corresponding RoleX API with named args
    And example: use("!society.born", { id: "sean", content: "..." })

  Scenario: Permissions — execute directly
    Given your permissions list the operations you are authorized to perform
    When you need to execute a permitted operation
    Then call use with the command from the permission — no skill loading needed
    And each permission's Parameters scenario documents the exact command and arguments

  Scenario: Skills — load before execution
    Given your procedures list the skills you have
    When you need to execute a command from a skill you have not loaded
    Then you MUST call skill(locator) first to load the full instructions
    And the loaded skill will tell you the exact command name and arguments
    And only then call use with the correct command and flat named parameters
    And do not guess commands from unloaded skills — load first, then execute

  Scenario: Unknown commands — stop and check
    Given a command is not found in your permissions or any loaded skill
    When the AI considers trying it anyway
    Then STOP — the command is outside your current scope
    And check if a procedure covers this task and load the skill
    And if no procedure covers it, the task is outside your duties — suggest Nuwa

  Scenario: Regular commands delegate to ResourceX
    Given the command does not start with !
    Then it is treated as a ResourceX locator
    And resolved through the ResourceX ingest pipeline
