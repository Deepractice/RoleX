Feature: own — assign product owner
  Assign an individual as an owner of a product.
  Owners are responsible for the product's direction and success.

  Scenario: Assign an owner
    Given a product and an individual exist
    When own is called with the product and individual
    Then the individual becomes an owner of the product

  Scenario: Parameters
    Given the command is product.own
    Then product is required — the product's id
    And individual is required — the individual's id (owner)
