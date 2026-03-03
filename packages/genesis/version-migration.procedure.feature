Feature: Version Migration
  version-migration

  Scenario: When to use this skill
    Given a user has legacy RoleX data (pre-1.0) in ~/.rolex
    And they need to migrate individuals, organizations, and knowledge
    When the user asks to migrate or upgrade from an old version
    Then load this skill for the migration process
