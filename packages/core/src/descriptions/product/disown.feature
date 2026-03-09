Feature: disown — remove product owner
  Remove an individual as an owner of a product.
  The individual is no longer responsible for the product.

  Scenario: Remove an owner
    Given an individual is an owner of a product
    When disown is called with the product and individual
    Then the individual is no longer an owner of the product

  Scenario: Parameters
    Given the command is product.disown
    Then product is required — the product's id
    And individual is required — the individual's id (owner to remove)
