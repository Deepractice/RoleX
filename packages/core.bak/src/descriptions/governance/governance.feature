Feature: Governance System
  Internal organization operations — membership, positions, assignments.

  Scenario: Membership
    Given an organization exists
    Then hire adds a role as a member
    And fire removes a role from membership

  Scenario: Positions
    Given an organization has governance
    Then establish creates a position with duties
    And abolish removes a position

  Scenario: Assignments
    Given roles are members and positions exist
    Then appoint assigns a role to a position
    And dismiss removes a role from a position

  Scenario: Directory
    Given an organization has members and positions
    Then directory shows all members and their assignments
