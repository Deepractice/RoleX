Feature: strategy — define product strategy
  Define the strategy for a product.
  The strategy describes the product's direction, positioning, and competitive approach.

  Scenario: Define product strategy
    Given a product exists in society
    And a Gherkin source describing the strategy
    When strategy is called on the product with a strategy id
    Then the strategy is stored as the product's information

  Scenario: Parameters
    Given the command is product.strategy
    Then product is required — the product's id
    And content is required — Gherkin Feature source for the strategy
    And id is required — strategy id

  Scenario: Writing the strategy Gherkin
    Given the strategy defines the product's direction
    Then the Feature title names the strategy
    And Scenarios describe positioning, target audience, and competitive approach
    And the tone is strategic — articulating where the product is headed and why
