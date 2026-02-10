Feature: Capability — skills and tools
  A role has procedures (skill summaries) and can use external tools.
  Progressive disclosure: know what exists, then load when needed.

  Scenario: Procedure as skill index
    Given a role has been trained with procedures
    Then procedures are loaded at identity time as part of cognition
    And each procedure is a Gherkin summary of what a skill can do
    And I know what skills I have without loading their full content
    And this is like seeing tool names and descriptions — lightweight awareness

  Scenario: Apply to load instructions
    Given I know a procedure exists from my identity
    When I need the detailed instructions for that skill
    Then I call apply with the procedure name
    And the full procedural knowledge is loaded into my context

  Scenario: Use to execute tools
    Given a resource locator identifies an executable tool
    When I need to actually run a tool — not just read about it
    Then I call use with the locator and optional arguments
    And ResourceX resolves and executes the tool
    And the result is returned to me

  Scenario: Progressive disclosure
    Given the three layers of capability awareness
    Then identity loads procedure summaries — I know what exists
    And apply loads full instructions — I know how to do it
    And use executes the tool — I actually do it
    And each layer adds detail only when needed
