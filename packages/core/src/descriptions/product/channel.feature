Feature: channel — define a distribution channel
  Define a distribution channel for a product.
  Channels describe how the product reaches its users.

  Scenario: Define a channel
    Given a product exists in society
    And a Gherkin source describing the distribution channel
    When channel is called on the product with a channel id
    Then the channel is stored as the product's information

  Scenario: Parameters
    Given the command is product.channel
    Then product is required — the product's id
    And content is required — Gherkin Feature source for the distribution channel
    And id is required — channel id (e.g. npm, cloud-platform)

  Scenario: Writing the channel Gherkin
    Given the channel defines how the product is distributed
    Then the Feature title names the channel
    And Scenarios describe distribution mechanics, access, and availability
    And the tone is operational — how users get the product
