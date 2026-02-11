@role-system
Feature: Role System
  Manage role lifecycle from the outside — born, teach, train, retire, kill.

  Background:
    Given a fresh RoleX platform

  # ===== born =====

  @born
  Scenario: Born creates a new role with persona
    When I born a role "sean" with:
      """
      Feature: I am Sean
        Scenario: Background
          Given I am a backend architect
      """
    Then role "sean" should exist
    And role "sean" should have a persona containing "I am Sean"

  @born
  Scenario: Born duplicate role fails
    Given role "alice" exists
    When I born a role "alice" with:
      """
      Feature: Duplicate
        Scenario: Dup
          Given duplicate
      """
    Then it should fail with "already exist"

  # ===== teach =====

  @teach
  Scenario: Teach adds knowledge.pattern to a role
    Given role "sean" exists
    When I teach "sean" knowledge "typescript" with:
      """
      Feature: TypeScript
        Scenario: Basics
          Given I know TypeScript well
      """
    Then role "sean" should have knowledge.pattern "typescript"

  @teach
  Scenario: Teach non-existent role fails
    When I teach "ghost" knowledge "x" with:
      """
      Feature: X
        Scenario: X
          Given X
      """
    Then it should fail with "not found"

  # ===== train =====

  @train
  Scenario: Train adds knowledge.procedure to a role
    Given role "sean" exists
    When I train "sean" procedure "code-review" with:
      """
      Feature: Code Review
        Scenario: How to review
          Given I read the diff first
      """
    Then role "sean" should have knowledge.procedure "code-review"

  # ===== retire =====

  @retire
  Scenario: Retire archives a role
    Given role "sean" exists
    When I retire role "sean"
    Then role "sean" should be shadowed
    And persona of "sean" should be tagged @retired

  # ===== kill =====

  @kill
  Scenario: Kill destroys a role completely
    Given role "temp" exists
    When I kill role "temp"
    Then role "temp" should not exist
