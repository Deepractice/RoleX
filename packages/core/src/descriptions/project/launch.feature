Feature: launch — create a new project
  Launch a new project in society.
  Projects organize work with scope, milestones, deliverables, and wiki.
  A project can optionally be linked to an owning organization.

  Scenario: Launch a project
    Given a Gherkin source describing the project
    When launch is called with the source
    Then a new project node is created in society
    And scope, milestones, deliverables, and wiki can be added
    And individuals can be enrolled as participants
    And products can be produced from the project

  Scenario: Parameters
    Given the command is org.launch
    Then content is optional — Gherkin Feature describing the project
    And id is optional — kebab-case identifier (e.g. "rolex")
    And alias is optional — alternative names
    And org is optional — owning organization id, creates an ownership link

  Scenario: Writing the project Gherkin
    Given the project Feature describes the work to be done
    Then the Feature title names the project
    And the description captures goals, scope, and context
    And Scenarios are optional — use them for distinct project concerns
