Feature: admin — set organization administrator
  Grant admin privileges to an individual within an organization.
  Admins can manage charter, membership, positions, and projects.

  Scenario: Set an admin
    Given an individual is a member of an organization
    When admin is called with the organization and individual
    Then the individual gains admin privileges for the organization
    And the individual can manage positions, projects, and membership

  Scenario: Parameters
    Given the command is org.admin
    Then org is required — the organization's id
    And individual is required — the individual's id
