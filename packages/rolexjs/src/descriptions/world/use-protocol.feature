Feature: Use protocol — unified execution entry point
  The use tool is the single entry point for all execution.
  A ! prefix signals a RoleX runtime command; everything else is a ResourceX resource.

  Scenario: ! prefix dispatches to RoleX runtime
    Given the locator starts with !
    Then it is parsed as !namespace.method
    And dispatched to the corresponding RoleX API with named args
    And available namespaces include individual, org, position, author, and prototype

  Scenario: Regular locators delegate to ResourceX
    Given the locator does not start with !
    Then it is treated as a ResourceX locator
    And resolved through the ResourceX ingest pipeline

  Scenario: Skill-driven knowledge
    Given specific commands within each namespace are documented in their respective skills
    When a role has mastered the relevant skill
    Then it knows which commands are available and how to use them
    And the use protocol itself only needs to route correctly
