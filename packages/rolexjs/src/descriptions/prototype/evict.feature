Feature: evict — unregister a prototype from the world
  Remove a previously settled prototype from the local registry.
  Existing individuals and organizations created from this prototype are not affected.

  Scenario: Evict a prototype
    Given a prototype is registered locally
    When evict is called with the prototype id
    Then the prototype is removed from the registry
    And existing individuals and organizations created from it remain intact
