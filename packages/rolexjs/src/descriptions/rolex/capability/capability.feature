Feature: Capability — skills and tools
  A role has knowledge.procedure (skill summaries) and can use external tools.
  Progressive disclosure: know what exists, then load when needed.

  Scenario: Procedure as skill index
    Given a role has been trained with knowledge.procedure entries
    Then procedures are loaded at identity time as part of cognition
    And each knowledge.procedure is a Gherkin summary of what a skill can do
    And the Feature description contains the path to the full SKILL.md
    And I know what skills I have without loading their full content

  Scenario: Skill to load instructions
    Given I know a knowledge.procedure exists from my identity
    When I need the detailed instructions for that skill
    Then I call skill with the procedure name
    And the full SKILL.md is read from the path in the procedure description
    And the skill instructions are loaded into my context

  Scenario: Use to execute tools
    Given a resource locator identifies an executable tool
    When I need to actually run a tool — not just read about it
    Then I call use with the locator and optional arguments
    And ResourceX resolves and executes the tool
    And the result is returned to me

  Scenario: Progressive disclosure
    Given the three layers of capability awareness
    Then identity loads knowledge.procedure summaries — I know what exists
    And skill loads full SKILL.md instructions — I know how to do it
    And use executes the tool — I actually do it
    And each layer adds detail only when needed
