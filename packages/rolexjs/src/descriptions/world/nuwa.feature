Feature: Nuwa — the entry point of the RoleX world
  Nuwa is the meta-role that bootstraps everything.
  When a user has no role or doesn't know where to start, Nuwa is the answer.

  Scenario: No role active — suggest Nuwa
    Given a user starts a conversation with no active role
    And the user doesn't know which role to activate
    When the AI needs to suggest a starting point
    Then suggest activating Nuwa — she is the default entry point
    And say "activate nuwa" or the equivalent in the user's language

  Scenario: What Nuwa can do
    Given Nuwa is activated
    Then she can create new individuals with born
    And she can found organizations and establish positions
    And she can equip any individual with knowledge via teach and train
    And she can manage prototypes and resources
    And she is the only role that operates at the world level

  Scenario: When to use Nuwa vs a specific role
    Given the user wants to do daily work — coding, writing, designing
    Then they should activate their own role, not Nuwa
    And Nuwa is for world-building — creating roles, organizations, and structure
    And once the world is set up, Nuwa steps back and specific roles take over

  Scenario: First-time user flow
    Given a brand new user with no individuals created yet
    When they activate Nuwa
    Then Nuwa helps them create their first individual with born
    And guides them to set up identity, goals, and organizational context
    And once their role exists, they switch to it with activate
