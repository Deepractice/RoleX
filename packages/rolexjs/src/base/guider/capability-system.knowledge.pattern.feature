Feature: Capability System
  How AI roles acquire and use skills — three-layer progressive disclosure.
  Procedure summary (identity) → full SKILL.md (skill) → execution (use).

  Scenario: Knowledge types
    Given a user asks about knowledge categories
    Then knowledge.pattern is transferable principles — always loaded when the AI activates identity
    And knowledge.procedure is skill summaries — loaded at identity, full content on demand
    And knowledge.theory is unified principles — the big picture across patterns

  Scenario: Procedure as skill index
    Given an AI role has been trained with knowledge.procedure
    Then procedures are loaded at identity time as part of the AI's cognition
    And each procedure is a Gherkin summary of what a skill can do
    And the Feature description contains the ResourceX locator
    And the AI knows what skills exist without loading full content

  Scenario: Skill loads full instructions
    Given an AI role needs detailed instructions for a capability
    Then the role calls skill with the ResourceX locator
    And the full SKILL.md content is loaded into the AI's context
    And skills are stored and distributed via ResourceX

  Scenario: Use executes tools
    Given an AI role needs to run an external tool
    Then the role calls use with a ResourceX locator and optional arguments
    And ResourceX resolves and executes the tool
    And the result is returned to the AI

  Scenario: Teach vs train
    Given a user asks about cultivating a role's capabilities
    Then teach adds knowledge.pattern — principles the AI always carries
    And train adds knowledge.procedure — operational skills loaded on demand
    And teach is for what the AI thinks about, train is for what it can do
    And both are Role System operations done TO the role from outside
