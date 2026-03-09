Feature: release — define a product release
  Define a release for a product.
  Releases mark versioned snapshots of the product with change descriptions.

  Scenario: Define a release
    Given a product exists in society
    And a Gherkin source describing the release
    When release is called on the product with a release id
    Then the release is stored as the product's information

  Scenario: Parameters
    Given the command is product.release
    Then product is required — the product's id
    And content is required — Gherkin Feature source for the release
    And id is required — release id (e.g. v1.0.0)

  Scenario: Writing the release Gherkin
    Given the release defines a versioned snapshot of the product
    Then the Feature title names the version
    And Scenarios describe what changed, was added, fixed, or removed
    And the tone is factual — documenting what this release includes
