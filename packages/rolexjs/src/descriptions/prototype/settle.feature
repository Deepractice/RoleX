Feature: settle — register a prototype into the world
  Pull a prototype from a ResourceX source and register it locally.
  Once settled, the prototype can be used to create individuals or organizations.

  Scenario: Settle a prototype
    Given a valid ResourceX source exists (URL, path, or locator)
    When settle is called with the source
    Then the resource is ingested and its state is extracted
    And the prototype is registered locally by its id
    And the prototype is available for born, activate, and organizational use
