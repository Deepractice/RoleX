Feature: deprecate — deprecate a product
  Mark a product as deprecated.
  The product is no longer actively maintained or recommended.

  Scenario: Deprecate a product
    Given a product exists in society
    When deprecate is called on the product
    Then the product is marked as deprecated

  Scenario: Parameters
    Given the command is product.deprecate
    Then product is required — the product's id
