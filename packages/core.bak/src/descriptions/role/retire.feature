Feature: retire
  Archive a role — deactivate but preserve all data.

  Scenario: Retire a role
    Given a role exists and is no longer active
    When I call retire with the role name
    Then the role is shadowed (soft-deleted)
    And the persona is tagged with @retired
    And all data is preserved for potential restoration
