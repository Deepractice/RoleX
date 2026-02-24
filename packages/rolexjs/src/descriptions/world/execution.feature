Feature: Execution — the doing cycle
  The role pursues goals through a structured lifecycle.
  activate → want → plan → todo → finish → complete or abandon.

  Scenario: Declare a goal
    Given I know who I am via activate
    When I want something — a desired outcome
    Then I declare it with want(id, goal)
    And focus automatically switches to this new goal

  Scenario: Plan and create tasks
    Given I have a focused goal
    Then I call plan(id, plan) to break it into logical phases
    And I call todo(id, task) to create concrete, actionable tasks

  Scenario: Execute and finish
    Given I have tasks to work on
    When I complete a task
    Then I call finish(id) to mark it done
    And an encounter is created — a raw record of what happened
    And I optionally capture what happened via the encounter parameter

  Scenario: Complete or abandon a plan
    Given tasks are done or the plan's strategy is no longer viable
    When the plan is fulfilled I call complete()
    Or when the plan should be dropped I call abandon()
    Then an encounter is created for the cognition cycle

  Scenario: Goals are long-term directions
    Given goals do not have achieve or abandon operations
    When a goal is no longer needed
    Then I call forget to remove it
    And learning is captured at the plan and task level, not the goal level

  Scenario: Multiple goals
    Given I may have several active goals
    When I need to switch between them
    Then I call focus(id) to change the currently focused goal
    And subsequent plan and todo operations target the focused goal
