Feature: Organization management skill required
  This position requires the ability to manage organizations —
  founding, chartering, membership, and dissolution.

  Scenario: When this skill is needed
    Given the position involves creating or managing organizations
    When an individual is appointed to this position
    Then they must have the organization-management procedure
