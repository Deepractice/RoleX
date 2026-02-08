@rolex @owner @goal @done
Feature: Wrap Gherkin parser as @rolexjs/parser
  As the Rolex owner, I need a dedicated parser package that wraps
  @cucumber/gherkin, so Rolex owns the parsing interface while
  delegating implementation to the battle-tested official parser.

  Scenario: Deliver @rolexjs/parser with re-exported types
    Given Gherkin is the first-class citizen from cognition/002
    When I create @rolexjs/parser package
    Then it provides a simple parse() function:
      | input          | output          |
      | Gherkin string | GherkinDocument |
    And it re-exports all essential Gherkin types:
      | type            |
      | GherkinDocument |
      | Feature         |
      | Scenario        |
      | Step            |
      | DataTable       |
      | DocString       |
      | Tag             |
      | Comment         |
    And it wraps @cucumber/gherkin without leaking internals

  Scenario: Verify parser handles all Gherkin constructs
    Given the parser is ready
    Then it passes tests for:
      | construct       | status |
      | Basic Feature   | pass   |
      | Tags            | pass   |
      | Data Tables     | pass   |
      | Doc Strings     | pass   |
      | Comments        | pass   |
      | Chinese Gherkin | pass   |
