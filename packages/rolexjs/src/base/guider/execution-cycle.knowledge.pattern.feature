Feature: Execution Cycle
  How an AI role pursues goals through structured phases.
  want → plan → todo → finish → complete (or abandon).
  These are cognitive processes the AI agent calls as MCP tools.

  Scenario: Setting a goal
    Given an AI role needs to work on something
    Then the role calls want to declare a goal — a desired outcome in Gherkin
    And focus automatically switches to the new goal
    And a role can have multiple active goals, switch with focus

  Scenario: Planning
    Given a goal exists but has no plan yet
    Then the role calls plan to create a plan — breaking the goal into logical phases
    And multiple plans can exist for one goal — the latest is focused
    And plans are Gherkin Features describing the approach

  Scenario: Creating tasks
    Given a plan exists
    Then the role calls todo to create concrete tasks — actionable units of work
    And tasks are automatically associated with the currently focused plan
    And each task should be small enough to finish in one session

  Scenario: Finishing tasks
    Given a task is complete
    Then the role calls finish with the task name
    And optionally provides an encounter — a record of what happened
    And the task is consumed and an encounter is created

  Scenario: Completing plans
    Given all tasks are done and the plan's strategy succeeded
    Then the role calls complete to mark the plan as done
    And an encounter is created — recording the strategy outcome
    And the plan is consumed

  Scenario: Abandoning plans
    Given a plan's strategy is no longer viable
    Then the role calls abandon to drop the plan
    And an encounter is created — lessons from the failed approach
    And the plan is consumed

  Scenario: Goals are long-term directions
    Given goals do not have complete or abandon operations
    When a goal is no longer needed
    Then the role calls forget to remove it
    And learning is captured at the plan and task level
