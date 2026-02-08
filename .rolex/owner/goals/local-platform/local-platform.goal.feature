@rolex @owner @goal
Feature: Load roles from local filesystem as @rolexjs/local-platform
  As the Rolex owner, I need a platform package that reads .rolex/<role>/
  directories, parses .feature files with @rolexjs/parser, and constructs
  Role instances from @rolexjs/core interfaces.

  Scenario: Deliver a loadRole API
    Given @rolexjs/core defines the Role interface
    And @rolexjs/parser can parse Gherkin
    When I create @rolexjs/local-platform
    Then it provides a loadRole function:
      | input                    | output       |
      | path to a role directory | Role instance |
    And it reads all .feature files from the directory
    And it uses file naming convention to classify dimensions:
      | pattern                | dimension  |
      | *.cognition.feature    | Cognition  |
      | *.goal.feature         | Goal       |
      | *.plan.feature         | Plan       |
      | *.task.feature         | Task       |

  Scenario: Verify the Role is correctly constructed
    Given a .rolex/owner/ directory with cognition and goal files
    When I call loadRole(".rolex/owner")
    Then the returned Role has:
      | field              | populated from                    |
      | name               | directory name ("owner")          |
      | cognition.resources | *.cognition.feature file contents |
      | goals              | *.goal.feature parsed structures  |
