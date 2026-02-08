@rolex @owner @goal @done
Feature: Define core interfaces for the five-dimension model
  As the Rolex owner, I need pure TypeScript interfaces that capture
  the five-dimension model, so all platforms build on the same contract.

  Scenario: Deliver @rolexjs/core with zero dependencies
    Given the five-dimension model from cognition/001
    When I create @rolexjs/core package
    Then it exports these interfaces:
      | interface    | purpose                          |
      | Role         | Top-level container              |
      | Cognition    | Static knowledge (TextResource)  |
      | Goal         | Dynamic objective                |
      | Plan         | Task list to achieve the goal    |
      | Task         | Concrete unit of work            |
      | Skill        | Capability reference             |
      | Verification | Criteria for goal closure        |
    And the package has zero runtime dependencies
    And it builds with tsup to ESM + .d.ts

  Scenario: Verify the interfaces are usable
    Given @rolexjs/core is published
    Then other packages can import types:
      | consumer         | usage                        |
      | local-platform   | Construct Role instances      |
      | future platforms | Same contract, new loaders   |
    And changing core interfaces forces consumers to update
