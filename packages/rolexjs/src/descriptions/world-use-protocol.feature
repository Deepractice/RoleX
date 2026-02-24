Feature: Use protocol — unified execution through ! commands
  The use tool is the single entry point for all execution.
  A ! prefix signals a RoleX runtime command; everything else is a ResourceX resource.

  Scenario: ! prefix dispatches to RoleX runtime
    Given the locator starts with !
    Then it is parsed as !namespace.method
    And dispatched to the corresponding RoleX API with named args
    And the result is returned directly

  Scenario: Available ! commands
    Given ! routes to RoleX namespaces
    Then !individual.born creates an individual
    And !individual.teach injects a principle
    And !individual.train injects a procedure
    And !org.found creates an organization
    And !org.charter defines a charter
    And !org.hire adds a member
    And !org.fire removes a member
    And !org.dissolve dissolves an organization
    And !position.establish creates a position
    And !position.charge adds a duty
    And !position.appoint assigns an individual
    And !position.dismiss removes an individual
    And !position.abolish abolishes a position

  Scenario: Regular locators delegate to ResourceX
    Given the locator does not start with !
    Then it is treated as a ResourceX locator
    And resolved through the ResourceX ingest pipeline
    And the resource content is returned

  Scenario: Why ! matters
    Given RoleX has runtime state that ResourceX cannot access
    And ResourceX is designed for serverless stateless execution
    When ! provides a clear boundary between runtime and resource
    Then runtime commands execute with full state access
    And resource operations remain stateless and sandboxable
