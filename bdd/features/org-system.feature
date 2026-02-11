@org-system
Feature: Organization System
  Organization lifecycle — found and dissolve.

  Background:
    Given a fresh RoleX platform

  # ===== found =====

  @found
  Scenario: Found creates an organization with charter
    When I found org "deepractice" with:
      """
      Feature: Deepractice Charter
        Scenario: Mission
          Given we build AI agent tools
      """
    Then org "deepractice" should exist
    And org "deepractice" should have charter containing "we build AI agent tools"

  @found
  Scenario: Found duplicate org fails
    Given org "acme" exists
    When I found org "acme" with:
      """
      Feature: Duplicate
        Scenario: Dup
          Given duplicate
      """
    Then it should fail with "already exist"

  # ===== dissolve =====

  @dissolve
  Scenario: Dissolve destroys organization and cascades
    Given org "acme" exists with position "engineer" and member "alice"
    When I dissolve org "acme"
    Then org "acme" should be shadowed
    And position "engineer" should be shadowed in "acme"
