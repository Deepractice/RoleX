---
name: prototype-management
description: Manage prototypes — settle and evict. Use when you need to register or remove prototypes from the runtime.
---

Feature: Prototype Registry
  Register and unregister prototypes.
  A prototype is an instruction set (prototype.json + .feature files) that materializes
  roles, organizations, and positions in the runtime when settled.

  Scenario: settle — execute a prototype into the world
    Given you have a ResourceX source (local path or locator) containing a prototype
    When you call use with !prototype.settle
    Then the prototype.json is loaded and all @filename references are resolved
    And each instruction is executed in order against the runtime
    And the prototype id and source are registered in the prototype registry
    And parameters are:
      """
      use("!prototype.settle", { source: "./prototypes/rolex" })
      use("!prototype.settle", { source: "deepractice/rolex" })
      """

  Scenario: evict — remove a prototype from the registry
    Given a prototype is no longer needed
    When you call use with !prototype.evict
    Then the id is removed from the prototype registry
    And runtime entities created by the prototype are NOT removed
    And parameters are:
      """
      use("!prototype.evict", { id: "rolex" })
      """

  Scenario: Settle is idempotent
    Given a prototype has already been settled
    When settle is called again with the same source
    Then existing entities are skipped (all ops check for duplicate ids)
    And the result is identical to the first settle

  Scenario: Auto-born on activate
    Given a prototype is registered but no runtime individual exists
    When activate is called with the individual's id
    Then the individual is automatically born from the prototype
