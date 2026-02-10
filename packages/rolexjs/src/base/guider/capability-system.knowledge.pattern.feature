Feature: Capability System
  How roles acquire and use skills — three-layer progressive disclosure.
  Procedure summary (identity) → full SKILL.md (skill) → execution (use).

  Scenario: Knowledge types
    Given a user asks about knowledge categories
    Then knowledge.pattern is transferable principles — always loaded at identity
    And knowledge.procedure is skill summaries — loaded at identity, full content on demand
    And knowledge.theory is unified principles — the big picture across patterns

  Scenario: Procedure as skill index
    Given a role has been trained with knowledge.procedure
    Then procedures are loaded at identity time as part of cognition
    And each procedure is a Gherkin summary of what a skill can do
    And the Feature description contains the ResourceX locator
    And the role knows what skills exist without loading full content

  Scenario: Skill loads full instructions
    Given a role needs detailed instructions for a procedure
    Then they call skill with the ResourceX locator
    And the full SKILL.md content is loaded into context
    And skills are stored and distributed via ResourceX

  Scenario: Use executes tools
    Given a role needs to run an external tool
    Then they call use with a ResourceX locator and optional arguments
    And ResourceX resolves and executes the tool
    And the result is returned

  Scenario: Teach vs train
    Given a user asks when to use teach vs train
    Then teach adds knowledge.pattern — principles the role always carries
    And train adds knowledge.procedure — operational skills loaded on demand
    And teach is for what the role thinks about, train is for what it can do
