Feature: dissolve — dissolve an organization
  Move an organization to the past archive.
  The organization and its subtree are archived, not deleted.

  Scenario: Dissolve an organization
    Given an organization exists in society
    When dissolve is called on the organization
    Then the organization is moved to the past archive
    And the organization's subtree (charter, positions) is preserved in past

  Scenario: Parameters
    Given the command is org.dissolve
    Then org is required — the organization's id
