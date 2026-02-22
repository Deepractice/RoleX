Feature: Execution Cycle
  How an AI role pursues goals through structured phases.
  want → design → todo → finish → achieve (or abandon).
  These are cognitive processes the AI agent calls as MCP tools.

  Scenario: Setting a goal
    Given an AI role needs to work on something
    Then the role calls want to declare a goal — a desired outcome in Gherkin
    And focus automatically switches to the new goal
    And a role can have multiple active goals, switch with focus

  Scenario: Planning
    Given a goal exists but has no plan yet
    Then the role calls design to create a plan — breaking the goal into logical phases
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
    And optionally provides a conclusion — a summary of what happened
    And the task gets marked @done

  Scenario: Achieving goals
    Given all tasks are done and the goal is fulfilled
    Then the role calls achieve with conclusion and experience
    And conclusion records what happened — the factual summary
    And experience captures what was learned — the transferable insight
    And both are required — achieve is the moment of reflection

  Scenario: Abandoning goals
    Given a goal is no longer viable
    Then the role calls abandon — optionally with conclusion and experience
    And the goal gets marked @abandoned
    And lessons can still be captured even from abandoned goals
