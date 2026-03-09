---
name: product-management
description: Manage product lifecycle — strategy, specs, releases, channels, ownership, and deprecation. Use when you need to manage products created from projects.
---

Feature: Product Content
  Define and enrich a product with strategy, behavior contracts, releases, and channels.
  Products are created via project.produce (see project-management skill).

  Scenario: strategy — define product strategy
    Given a product needs a strategic direction
    When you call use with !product.strategy
    Then a strategy node is created under the product
    And parameters are:
      """
      command: "!product.strategy"
      args:
        product: "my-product"
        content: "Feature: Go-to-market Strategy\n  Scenario: Target audience\n    Given developers building backend services\n    Then position as the simplest DDD framework"
        id: "gtm-strategy"
      """

  Scenario: spec — add a behavior contract
    Given a product needs BDD specifications
    When you call use with !product.spec
    Then a spec node is created under the product
    And the spec content should be a Gherkin Feature describing expected behavior
    And parameters are:
      """
      command: "!product.spec"
      args:
        product: "my-product"
        content: "Feature: Service Definition\n  Scenario: Fluent API\n    Given a developer creates a service\n    When using createService().rpc().run()\n    Then the service is defined declaratively"
        id: "service-definition"
      """

  Scenario: release — add a version release
    Given a product ships a new version
    When you call use with !product.release
    Then a release node is created under the product
    And the id should follow semver convention
    And parameters are:
      """
      command: "!product.release"
      args:
        product: "my-product"
        content: "Feature: v1.0.0 Release\n  Scenario: What's included\n    Given the core API is stable\n    Then createService, rpc, and run are public API\n    And DDD primitives are exported"
        id: "v1.0.0"
      """

  Scenario: channel — add a distribution channel
    Given a product needs distribution channels
    When you call use with !product.channel
    Then a channel node is created under the product
    And parameters are:
      """
      command: "!product.channel"
      args:
        product: "my-product"
        content: "Feature: NPM Channel\n  Scenario: Package distribution\n    Given the package is published to npm\n    Then users install via npm install my-product"
        id: "npm"
      """

Feature: Product Ownership
  Assign and remove product owners.
  Ownership links an individual to a product.

  Scenario: own — assign an owner
    Given a product needs a responsible individual
    When you call use with !product.own
    Then the individual becomes the owner of the product
    And parameters are:
      """
      command: "!product.own"
      args:
        product: "my-product"
        individual: "sean"
      """

  Scenario: disown — remove an owner
    Given an individual should no longer own a product
    When you call use with !product.disown
    Then the individual is removed as owner
    And parameters are:
      """
      command: "!product.disown"
      args:
        product: "my-product"
        individual: "sean"
      """

Feature: Product Lifecycle
  Manage the end-of-life of a product.

  Scenario: deprecate — retire a product
    Given a product is no longer maintained
    When you call use with !product.deprecate
    Then the product is moved to the past collection
    And all data is preserved
    And parameters are:
      """
      command: "!product.deprecate"
      args:
        product: "my-product"
      """

Feature: Common Workflows

  Scenario: Enrich a newly created product
    Given a product was just created via project.produce
    Then follow this sequence:
      """
      1. command: "!product.strategy", args: { product: "my-product", content: "Feature: ...", id: "core-strategy" }
      2. command: "!product.spec", args: { product: "my-product", content: "Feature: ...", id: "core-api" }
      3. command: "!product.channel", args: { product: "my-product", content: "Feature: ...", id: "npm" }
      4. command: "!product.own", args: { product: "my-product", individual: "sean" }
      """

  Scenario: Ship a release
    Given a product version is ready
    Then the sequence is:
      """
      1. command: "!product.release", args: { product: "my-product", content: "Feature: ...", id: "v1.0.0" }
      2. Optionally add new specs for the release
      3. Optionally add new channels
      """

  Scenario: View product state
    Given you want to see a product's current state
    Then use census.list to find products
    And the product node contains children: strategy, spec, release, channel
    And the product links show: ownership (to individual), origin (to project)
