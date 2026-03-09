Feature: spec — define product specification
  Define a behavior contract (BDD specification) for a product.
  Specs describe the expected behavior of the product in Gherkin format.

  Scenario: Define a product spec
    Given a product exists in society
    And a Gherkin source describing the behavior contract
    When spec is called on the product with a spec id
    Then the spec is stored as the product's information

  Scenario: Parameters
    Given the command is product.spec
    Then product is required — the product's id
    And content is required — Gherkin Feature source for the behavior contract (BDD specification)
    And id is required — spec id (keywords joined by hyphens)

  Scenario: Writing the spec Gherkin
    Given the spec defines expected product behavior
    Then the Feature title names the behavior or capability
    And Scenarios describe Given-When-Then acceptance criteria
    And the tone is precise — specifying exactly what the product should do
