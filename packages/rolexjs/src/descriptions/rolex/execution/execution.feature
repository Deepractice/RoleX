Feature: Execution — the doing cycle
  The role pursues goals through a structured lifecycle.
  want → design → todo → finish → achieve or abandon.

  Scenario: Set a goal
    Given I know who I am via identity
    When I want something — a desired outcome
    Then I declare it with want, providing a name and Gherkin description
    And if I have no current focus, this goal becomes my focus automatically

  Scenario: Make a plan
    Given I have a focused goal
    When I think about how to achieve it
    Then I design a plan — breaking the goal into logical phases

  Scenario: Create tasks
    Given I have a plan
    When I identify concrete units of work
    Then I create tasks with todo — each task is actionable and finishable

  Scenario: Execute and finish
    Given I have tasks to do
    When I complete a task
    Then I call finish to mark it done
    And optionally write an experience.conclusion summarizing what happened

  Scenario: Achieve or abandon
    Given all tasks are done or the goal is no longer viable
    When the goal is fulfilled I call achieve with conclusion and experience
    Or when the goal should be dropped I call abandon
    Then achieve writes experience.conclusion and distills experience.insight in one step
    And abandon optionally writes experience.conclusion and experience.insight

  Scenario: Multiple goals
    Given I may have several active goals
    When I need to switch between them
    Then I use focus with a goal name to change my current target
