---
name: individual-management
description: Manage individual lifecycle and knowledge injection. Use when you need to create, retire, restore, or permanently remove individuals, or when you need to inject principles and procedures into an individual's knowledge.
---

Feature: Individual Lifecycle
  Manage the full lifecycle of individuals in the RoleX world.
  Individuals are persistent entities that hold identity, knowledge, goals, and experience.

  Scenario: born — create a new individual
    Given you want to bring a new individual into the world
    When you call born with a persona and an id
    Then a new individual node is created under society
    And the individual can be activated, hired into organizations, and taught skills
    And parameters are:
      """
      rolex individual born [OPTIONS]

      OPTIONS:
        --individual    Gherkin Feature source describing the persona
        -f, --file      Path to .feature file (alternative to --individual)
        --id            User-facing identifier (kebab-case, e.g. "sean", "nuwa")
        --alias         Comma-separated aliases (e.g. "女娲,nvwa")
      """
    And example:
      """
      rolex individual born --id sean --individual "Feature: Sean
        A backend architect who builds AI agent frameworks.

        Scenario: Background
          Given I am a software engineer
          And I specialize in systems design"
      """

  Scenario: born — persona writing guidelines
    Given the persona defines who this individual is
    Then the Feature title names the individual
    And the description captures personality, values, expertise, and background
    And Scenarios describe distinct aspects of the persona
    And keep it concise — identity is loaded at every activation

  Scenario: retire — archive an individual
    Given an individual should be temporarily deactivated
    When you call retire with the individual id
    Then the individual is moved to the past archive
    And all data is preserved for potential restoration via rehire
    And parameters are:
      """
      rolex individual retire <INDIVIDUAL>

      ARGUMENTS:
        INDIVIDUAL    Individual id (required)
      """

  Scenario: die — permanently remove an individual
    Given an individual should be permanently removed
    When you call die with the individual id
    Then the individual is moved to the past archive
    And this is semantically permanent — rehire is technically possible but not intended
    And parameters are:
      """
      rolex individual die <INDIVIDUAL>

      ARGUMENTS:
        INDIVIDUAL    Individual id (required)
      """

  Scenario: retire vs die — when to use which
    Given you need to remove an individual from active duty
    When the individual may return later (sabbatical, role rotation)
    Then use retire — it signals intent to restore
    When the individual is no longer needed (deprecated role, replaced)
    Then use die — it signals finality

  Scenario: rehire — restore a retired individual
    Given a retired individual needs to come back
    When you call rehire with the past node id
    Then the individual is restored to active society
    And all previous knowledge, experience, and history are intact
    And parameters are:
      """
      rolex individual rehire <PAST_NODE>

      ARGUMENTS:
        PAST_NODE    Past node id of the retired individual (required)
      """

Feature: Knowledge Injection
  Inject principles and procedures into an individual from the outside.
  This bypasses the cognition cycle — no encounters or experiences consumed.
  Use this to equip individuals with pre-existing knowledge and skills.

  Scenario: teach — inject a principle
    Given an individual needs a rule or guideline it hasn't learned through experience
    When you call teach with the individual id, principle content, and a principle id
    Then a principle is created directly under the individual
    And if a principle with the same id already exists, it is replaced (upsert)
    And parameters are:
      """
      rolex individual teach <INDIVIDUAL> [OPTIONS]

      ARGUMENTS:
        INDIVIDUAL    Individual id (required)

      OPTIONS:
        --principle     Gherkin Feature source for the principle
        -f, --file      Path to .feature file (alternative to --principle)
        --id            Principle id — keywords joined by hyphens
      """
    And example:
      """
      rolex individual teach sean --id always-validate-input --principle "Feature: Always validate input
        External data must be validated at system boundaries.

        Scenario: API endpoints
          Given data arrives from external clients
          When the data crosses the trust boundary
          Then validate type, format, and range before processing

        Scenario: File uploads
          Given a user uploads a file
          When the file enters the system
          Then verify file type, size, and content before storing"
      """

  Scenario: train — inject a procedure (skill reference)
    Given an individual needs a skill it hasn't mastered through experience
    When you call train with the individual id, procedure content, and a procedure id
    Then a procedure is created directly under the individual
    And if a procedure with the same id already exists, it is replaced (upsert)
    And the procedure Feature description MUST contain the ResourceX locator for the skill
    And parameters are:
      """
      rolex individual train <INDIVIDUAL> [OPTIONS]

      ARGUMENTS:
        INDIVIDUAL    Individual id (required)

      OPTIONS:
        --procedure     Gherkin Feature source for the procedure
        -f, --file      Path to .feature file (alternative to --procedure)
        --id            Procedure id — keywords joined by hyphens
      """
    And example:
      """
      rolex individual train sean --id skill-creator --procedure "Feature: Skill Creator
        https://github.com/Deepractice/RoleX/tree/main/skills/skill-creator

        Scenario: When to use this skill
          Given I need to create a new skill for a role
          When the skill requires directory structure and SKILL.md format
          Then load this skill for detailed instructions"
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
      1. born — create with persona and id
      2. teach — inject foundational principles (repeat as needed)
      3. train — inject skill procedures (repeat as needed)
      4. activate — verify the individual's state
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
    Then use forget (via role system) with the node id
    And only instance nodes can be forgotten — prototype nodes are read-only
