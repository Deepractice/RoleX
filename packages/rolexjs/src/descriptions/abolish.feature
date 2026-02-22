Feature: abolish — abolish a position
  Abolish a position within an organization.
  All duties and appointments associated with the position are removed.

  Scenario: Abolish a position
    Given a position exists within an organization
    When abolish is called on the position
    Then all duties and appointments are removed
    And the position no longer exists
