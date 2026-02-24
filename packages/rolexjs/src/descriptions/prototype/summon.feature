Feature: summon — register a prototype from source
  Pull a prototype from a ResourceX source and register it locally.
  Once summoned, the prototype can be used to create individuals with born.

  Scenario: Summon a prototype
    Given a valid ResourceX source exists (URL, path, or locator)
    When summon is called with the source
    Then the resource is ingested and its state is extracted
    And the prototype is registered locally by its id
    And the prototype is available for born and activate
