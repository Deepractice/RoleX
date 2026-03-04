Feature: Manage project lifecycle
  Oversee the full lifecycle of projects in the RoleX world.

  Scenario: Launching and scoping
    Given a new project needs to exist
    When launch is called with project content
    Then the project is created under society
    And scope can be defined for its boundary

  Scenario: Milestones and deliverables
    Given a project needs checkpoints and outputs
    When milestone or deliver is called
    Then milestones track progress and deliverables track outputs
    And milestones can be achieved when completed

  Scenario: Participation
    Given a project needs team members
    When enroll or remove is called
    Then individuals join or leave the project

  Scenario: Knowledge and archival
    Given a project accumulates knowledge or completes
    When wiki is called to capture knowledge
    And archive is called to close the project
    Then project knowledge is preserved and the project is archived to past
