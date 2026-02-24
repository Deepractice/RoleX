Feature: plan — create a plan for a goal
  Break a goal into logical phases or stages.
  Each phase is described as a Gherkin scenario. Tasks are created under the plan.

  A plan serves two purposes depending on how it relates to other plans:
  - Strategy (alternative): Plan A fails → abandon → try Plan B (fallback)
  - Phase (sequential): Plan A completes → start Plan B (after)

  Scenario: Create a plan
    Given a focused goal exists
    And a Gherkin source describing the plan phases
    When plan is called with an id and the source
    Then a new plan node is created under the goal
    And the plan becomes the focused plan
    And tasks can be added to this plan with todo

  Scenario: Sequential relationship — phase
    Given a goal needs to be broken into ordered stages
    When creating Plan B with after set to Plan A's id
    Then Plan B is linked as coming after Plan A
    And AI knows to start Plan B when Plan A completes
    And the relationship persists across sessions

  Scenario: Alternative relationship — strategy
    Given a goal has multiple possible approaches
    When creating Plan B with fallback set to Plan A's id
    Then Plan B is linked as a backup for Plan A
    And AI knows to try Plan B when Plan A is abandoned
    And the relationship persists across sessions

  Scenario: No relationship — independent plan
    Given plan is created without after or fallback
    Then it behaves as an independent plan with no links
    And this is backward compatible with existing behavior

  Scenario: Plan ID convention
    Given the id is keywords from the plan content joined by hyphens
    Then "Fix ID-less node creation" becomes id "fix-id-less-node-creation"
    And "JWT authentication strategy" becomes id "jwt-authentication-strategy"

  Scenario: Writing the plan Gherkin
    Given the plan breaks a goal into logical phases
    Then the Feature title names the overall approach or strategy
    And Scenarios represent distinct phases — each phase is a stage of execution
    And the tone is structural — ordering and grouping work, not detailing steps
