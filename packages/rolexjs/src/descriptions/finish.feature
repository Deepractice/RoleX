Feature: finish — complete a task
  Mark a task as done and create an encounter.
  The encounter records what happened and can be reflected on for learning.

  Scenario: Finish a task
    Given a task exists
    When finish is called on the task
    Then the task is marked done
    And an encounter is created under the role
    And the encounter can later be consumed by reflect

  Scenario: Finish with experience
    Given a task is completed with a notable learning
    When finish is called with an optional experience parameter
    Then the experience text is attached to the encounter

  Scenario: Writing the encounter Gherkin
    Given the encounter records what happened — a raw account of the experience
    Then the Feature title describes what was done
    And Scenarios capture what was done, what was encountered, and what resulted
    And the tone is concrete and specific — tied to this particular task
