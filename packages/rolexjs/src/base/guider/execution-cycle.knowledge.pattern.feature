Feature: Execution Cycle
  The doing cycle — how a role pursues goals through structured phases.
  want → design → todo → finish → achieve (or abandon).

  Scenario: Setting a goal
    Given a user wants to start working on something
    Then they declare a goal with want — a desired outcome in Gherkin
    And focus automatically switches to the new goal
    And a role can have multiple active goals, switch with focus

  Scenario: Planning
    Given a goal exists but has no plan yet
    Then they create a plan with design — breaking the goal into logical phases
    And multiple plans can exist for one goal — the latest is focused
    And plans are Gherkin Features describing the approach

  Scenario: Creating tasks
    Given a plan exists
    Then they create concrete tasks with todo — actionable units of work
    And tasks are automatically associated with the currently focused plan
    And each task should be small enough to finish in one session

  Scenario: Finishing tasks
    Given a task is complete
    Then they call finish with the task name
    And optionally provide a conclusion — a summary of what happened
    And the task gets marked @done

  Scenario: Achieving goals
    Given all tasks are done and the goal is fulfilled
    Then they call achieve with conclusion and experience
    And conclusion records what happened — the factual summary
    And experience captures what was learned — the transferable insight
    And both are required — achieve is the moment of reflection

  Scenario: Abandoning goals
    Given a goal is no longer viable
    Then they call abandon — optionally with conclusion and experience
    And the goal gets marked @abandoned
    And lessons can still be captured even from abandoned goals
