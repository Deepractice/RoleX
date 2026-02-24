Feature: dissolve — dissolve an organization
  Dissolve an organization.
  All positions, charter entries, and assignments are cascaded.

  Scenario: Dissolve an organization
    Given an organization exists
    When dissolve is called on the organization
    Then all positions within the organization are abolished
    And all assignments and charter entries are removed
    And the organization no longer exists
