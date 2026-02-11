Feature: Organization System
  Manage organizations — founding and dissolving.

  Scenario: Organization lifecycle
    Given organizations are groups that roles can belong to
    Then found creates a new organization
    And dissolve removes it
