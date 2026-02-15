Feature: Execution — the doing cycle
  The role pursues goals through a structured lifecycle.
  activate → want → plan → todo → finish → achieve or abandon.

  Scenario: Declare a goal
    Given I know who I am via activate
    When I want something — a desired outcome
    Then I declare it with want(id, goal)
    And focus automatically switches to this new goal

  Scenario: Plan and create tasks
    Given I have a focused goal
    Then I call plan(plan) to break it into logical phases
    And I call todo(id, task) to create concrete, actionable tasks

  Scenario: Execute and finish
    Given I have tasks to work on
    When I complete a task
    Then I call finish(id) to mark it done
    And an encounter is created — a raw record of what happened
    And I optionally capture what happened via the encounter parameter

  Scenario: Achieve or abandon
    Given tasks are done or the goal is no longer viable
    When the goal is fulfilled I call achieve()
    Or when the goal should be dropped I call abandon()
    Then an encounter is created for the cognition cycle

  Scenario: Multiple goals
    Given I may have several active goals
    When I need to switch between them
    Then I call focus(id) to change the currently focused goal
    And subsequent plan and todo operations target the focused goal
