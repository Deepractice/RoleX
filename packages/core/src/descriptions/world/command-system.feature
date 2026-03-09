Feature: Command system — how operations are executed in RoleX
  RoleX has two types of operation entry points:
  MCP tools (direct call) and commands (via use/direct tool).
  Understanding the difference is essential for executing any operation.

  Scenario: MCP tools — direct invocation
    Given MCP tools are: activate, want, plan, todo, finish, complete, abandon,
      focus, reflect, realize, master, forget, skill, use, direct, inspect, survey
    When the AI needs to perform one of these operations
    Then call the MCP tool directly — no indirection needed
    And example: to declare a goal, call the want MCP tool with content

  Scenario: Commands — invoked via use or direct
    Given commands follow the !namespace.method pattern
    And namespaces include individual, org, position, project, society, role, resource, prototype
    When the AI needs to execute a command
    Then call the use MCP tool (if a role is active) or direct MCP tool (if no role)
    And pass the command as the first argument with ! prefix
    And pass parameters as named args
    And example: use("!individual.born", { id: "sean", content: "Feature: Sean..." })
    And example: use("!org.hire", { org: "deepractice", individual: "sean" })

  Scenario: Where commands come from — three sources
    Given commands appear in three places in a role's state
    Then permissions grant pre-authorized commands — execute directly via use
    And procedures reference skills — load skill first, then execute commands from the skill
    And duties describe responsibilities — they may reference commands available via permissions
    And if a command is not found in permissions or loaded skills, it is outside your scope

  Scenario: Reading a permission's command reference
    Given each permission includes a command name and a description
    And the description's Parameters scenario documents the exact argument names
    When the AI needs to execute a permitted operation
    Then read the command name (e.g. individual.born) from the permission
    And read the argument names from the Parameters scenario (e.g. id, content, alias)
    And call use("!individual.born", { id: "...", content: "..." })

  Scenario: Common command namespaces
    Given individual commands manage people
    Then !individual.born creates, !individual.retire archives, !individual.rehire restores
    And !individual.teach injects a principle, !individual.train injects a procedure
    Given org commands manage organizations
    Then !org.found creates, !org.dissolve archives
    And !org.hire adds a member, !org.fire removes a member, !org.charter defines governance
    Given position commands manage positions
    Then !position.establish creates, !position.abolish archives
    And !position.appoint assigns, !position.dismiss removes, !position.charge adds duty
    Given project commands manage projects
    Then !project.launch creates, !project.archive archives
