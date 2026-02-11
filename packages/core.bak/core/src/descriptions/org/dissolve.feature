Feature: dissolve
  Dissolve an organization — cascade shadow to all internal structures.

  Scenario: Dissolve an organization
    Given an organization exists
    When I call dissolve with the organization name
    Then the organization is shadowed
    And all positions, charter entries, and assignments are cascaded
