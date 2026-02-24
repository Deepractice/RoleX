Feature: banish — unregister a prototype
  Remove a previously summoned prototype from the local registry.
  Existing individuals created from this prototype are not affected.

  Scenario: Banish a prototype
    Given a prototype is registered locally
    When banish is called with the prototype id
    Then the prototype is removed from the registry
    And existing individuals created from it remain intact
