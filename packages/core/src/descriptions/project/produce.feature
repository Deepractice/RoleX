Feature: produce — create a product from a project
  Create a product that is produced by a project.
  Products represent the deliverable artifacts that a project creates and maintains.

  Scenario: Produce a product
    Given a project exists in society
    When produce is called with the project and product details
    Then a new product node is created in society
    And the product is linked to the project
    And the product can have strategy, specs, releases, and channels

  Scenario: Parameters
    Given the command is project.produce
    Then project is required — the project's id
    And content is optional — Gherkin Feature source for the product (vision)
    And id is required — product id (kebab-case)
    And alias is optional — alternative names

  Scenario: Writing the product Gherkin
    Given the product Feature describes the vision and purpose
    Then the Feature title names the product
    And the description captures what the product is and why it exists
    And Scenarios are optional — use them for distinct aspects of the product vision
