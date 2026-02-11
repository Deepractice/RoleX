Feature: abolish
  Remove a position from the organization.

  Scenario: Abolish a position
    Given a position exists within an organization
    When I call abolish with the organization name and position name
    Then the position is shadowed
    And all duty and assignment nodes are cascaded
