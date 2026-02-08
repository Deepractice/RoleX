@rolex @owner @task
Feature: Implement cognition() method
  As the Rolex owner, I need cognition() to load all *.cognition.feature
  files from the role's cognition/ directory and return parsed Features.

  Scenario: Load cognition features
    Given a role directory with cognition/ subdirectory
    And it contains *.cognition.feature files
    When I call rolex.cognition()
    Then it returns Feature[] parsed from all cognition files
    And files are loaded in alphabetical order (001-, 002-, ...)

  Scenario: Empty cognition
    Given a role directory with no cognition/ subdirectory
    When I call rolex.cognition()
    Then it returns an empty Feature[]
