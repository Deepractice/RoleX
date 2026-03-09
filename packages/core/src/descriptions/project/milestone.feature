Feature: milestone — define a project milestone
  Define a milestone for a project.
  Milestones mark significant checkpoints or deliverable targets within the project.

  Scenario: Define a milestone
    Given a project exists in society
    And a Gherkin source describing the milestone
    When milestone is called on the project with a milestone id
    Then the milestone is stored as the project's information
    And the milestone can later be achieved

  Scenario: Parameters
    Given the command is project.milestone
    Then project is required — the project's id
    And content is required — Gherkin Feature source for the milestone
    And id is required — milestone id (keywords joined by hyphens)

  Scenario: Writing the milestone Gherkin
    Given the milestone defines a checkpoint in the project
    Then the Feature title names the milestone
    And Scenarios describe success criteria and acceptance conditions
    And the tone is goal-oriented — what must be true when the milestone is reached
