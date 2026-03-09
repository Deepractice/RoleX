Feature: unadmin — revoke organization administrator
  Revoke admin privileges from an individual within an organization.
  The individual remains a member but loses management capabilities.

  Scenario: Revoke admin
    Given an individual is an admin of an organization
    When unadmin is called with the organization and individual
    Then the individual loses admin privileges
    And the individual remains a member of the organization

  Scenario: Parameters
    Given the command is org.unadmin
    Then org is required — the organization's id
    And individual is required — the individual's id
