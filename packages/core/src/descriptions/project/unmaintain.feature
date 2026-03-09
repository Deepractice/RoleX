Feature: unmaintain — remove project maintainer
  Remove maintainer role from an individual on a project.

  Scenario: Remove a maintainer
    Given an individual is a maintainer of a project
    When unmaintain is called with the project and individual
    Then the individual is no longer a maintainer of the project

  Scenario: Parameters
    Given the command is project.unmaintain
    Then project is required — the project's id
    And individual is required — the individual's id
