Feature: deliver — define a project deliverable
  Define a deliverable for a project.
  Deliverables describe the concrete outputs produced by the project.

  Scenario: Define a deliverable
    Given a project exists in society
    And a Gherkin source describing the deliverable
    When deliver is called on the project with a deliverable id
    Then the deliverable is stored as the project's information

  Scenario: Parameters
    Given the command is project.deliver
    Then project is required — the project's id
    And content is required — Gherkin Feature source for the deliverable
    And id is required — deliverable id (keywords joined by hyphens)

  Scenario: Writing the deliverable Gherkin
    Given the deliverable defines a concrete output of the project
    Then the Feature title names the deliverable
    And Scenarios describe acceptance criteria and specifications
    And the tone is concrete — what is being produced and how it will be evaluated
