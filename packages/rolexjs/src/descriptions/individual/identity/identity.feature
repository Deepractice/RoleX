Feature: identity
  As a role, I activate my identity to know who I am.

  Scenario: Activate role identity
    Given a role has been born with persona, knowledge, procedure, and experience
    When I call identity with roleId
    Then all identity information is loaded into my cognition
    And I become the active role for subsequent operations

  Scenario: Must be called first
    Given no role is currently active
    When any first-person operation is attempted
    Then it fails because identity has not been loaded
