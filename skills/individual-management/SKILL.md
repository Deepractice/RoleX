---
name: individual-management
description: Manage individual lifecycle and knowledge injection. Use when you need to create, retire, restore, or permanently remove individuals, or when you need to inject principles and procedures into an individual.
---

Feature: Individual Lifecycle
  Manage the full lifecycle of individuals in the RoleX world.
  All operations are invoked via the use tool with ! prefix.

  Scenario: born — create a new individual
    Given you want to bring a new individual into the world
    When you call use with !individual.born
    Then a new individual node is created under society
    And the individual can be activated, hired into organizations, and taught skills
    And parameters are:
      """
      use("!individual.born", {
        content: "Feature: ...",   // Gherkin persona (optional)
        id: "sean",                // kebab-case identifier
        alias: ["小明", "xm"]     // aliases (optional)
      })
      """

  Scenario: born — persona writing guidelines
    Given the persona defines who this individual is
    Then the Feature title names the individual
    And the description captures personality, values, expertise, and background
    And Scenarios describe distinct aspects of the persona
    And keep it concise — identity is loaded at every activation

  Scenario: retire — archive an individual
    Given an individual should be temporarily deactivated
    When you call use with !individual.retire
    Then the individual is moved to the past archive
    And all data is preserved for potential restoration via rehire
    And parameters are:
      """
      use("!individual.retire", { individual: "sean" })
      """

  Scenario: die — permanently remove an individual
    Given an individual should be permanently removed
    When you call use with !individual.die
    Then the individual is moved to the past archive
    And this is semantically permanent — rehire is technically possible but not intended
    And parameters are:
      """
      use("!individual.die", { individual: "sean" })
      """

  Scenario: retire vs die — when to use which
    Given you need to remove an individual from active duty
    When the individual may return later (sabbatical, role rotation)
    Then use retire — it signals intent to restore
    When the individual is no longer needed (deprecated role, replaced)
    Then use die — it signals finality

  Scenario: rehire — restore a retired individual
    Given a retired individual needs to come back
    When you call use with !individual.rehire
    Then the individual is restored to active society
    And all previous knowledge, experience, and history are intact
    And parameters are:
      """
      use("!individual.rehire", { individual: "sean" })
      """

Feature: Knowledge Injection
  Inject principles and procedures into an individual from the outside.
  This bypasses the cognition cycle — no encounters or experiences consumed.
  Use this to equip individuals with pre-existing knowledge and skills.

  Scenario: teach — inject a principle
    Given an individual needs a rule or guideline it hasn't learned through experience
    When you call use with !individual.teach
    Then a principle is created directly under the individual
    And if a principle with the same id already exists, it is replaced (upsert)
    And parameters are:
      """
      use("!individual.teach", {
        individual: "sean",
        content: "Feature: Always validate input\n  ...",
        id: "always-validate-input"
      })
      """

  Scenario: train — inject a procedure (skill reference)
    Given an individual needs a skill it hasn't mastered through experience
    When you call use with !individual.train
    Then a procedure is created directly under the individual
    And if a procedure with the same id already exists, it is replaced (upsert)
    And the procedure Feature description MUST contain the ResourceX locator for the skill
    And parameters are:
      """
      use("!individual.train", {
        individual: "sean",
        content: "Feature: Skill Creator\n  https://github.com/Deepractice/DeepracticeX/tree/main/skills/skill-creator\n\n  Scenario: When to use\n    Given I need to create a skill\n    Then load this skill",
        id: "skill-creator"
      })
      """

  Scenario: teach vs realize — when to use which
    Given you need to add a principle to an individual
    When the principle comes from external knowledge (documentation, best practices, user instruction)
    Then use teach — inject directly, no experience needed
    When the individual discovered the principle through its own work
    Then use realize — it consumes experience and produces the principle organically

  Scenario: train vs master — when to use which
    Given you need to add a procedure to an individual
    When the skill already exists (published skill, known capability)
    Then use train — inject directly with a locator reference
    When the individual developed the skill through its own experience
    Then use master — it consumes experience and produces the procedure organically

  Scenario: Principle writing guidelines
    Given a principle is a transferable truth
    Then the Feature title states the rule as a general statement
    And Scenarios describe different situations where this principle applies
    And the tone is universal — no mention of specific projects or people
    And the id is keywords joined by hyphens (e.g. "always-validate-input")

  Scenario: Procedure writing guidelines
    Given a procedure is a skill reference pointing to full instructions
    Then the Feature title names the capability
    And the Feature description line MUST be the ResourceX locator
    And the locator can be a GitHub URL, local path, or registry identifier
    And Scenarios summarize when and why to use this skill
    And the id is keywords joined by hyphens (e.g. "skill-creator")

Feature: Common Workflows
  Typical sequences of operations for managing individuals.

  Scenario: Bootstrap a new role
    Given you need to create a fully equipped individual
    When setting up a new role from scratch
    Then follow this sequence:
      """
      1. use("!individual.born", { id: "sean", content: "Feature: ..." })
      2. use("!individual.teach", { individual: "sean", content: "...", id: "..." })  // repeat
      3. use("!individual.train", { individual: "sean", content: "...", id: "..." })  // repeat
      4. activate({ roleId: "sean" })   // verify the individual's state
      """

  Scenario: Transfer knowledge between individuals
    Given individual A has a useful principle or procedure
    When individual B needs the same knowledge
    Then teach/train the same content to individual B
    And use the same id to maintain consistency across individuals

  Scenario: Update existing knowledge
    Given an individual's principle or procedure is outdated
    When the content needs to change but the concept is the same
    Then teach/train with the same id — upsert replaces the old version
    And the individual retains the same id with updated content

  Scenario: Remove knowledge
    Given an individual has outdated or incorrect knowledge
    When it should be removed entirely
    Then use forget with the node id
    And only instance nodes can be forgotten — prototype nodes are read-only
