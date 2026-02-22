@governance-system
Feature: Governance System
  Internal org management — rule, establish, hire, appoint, fire, dismiss, abolish, assign, directory.

  Background:
    Given a fresh RoleX platform
    And org "deepractice" exists
    And role "alice" exists
    And role "bob" exists

  # ===== rule =====

  @rule
  Scenario: Rule writes a charter entry
    When I rule "deepractice" charter "code-standards" with:
      """
      Feature: Code Standards
        Scenario: TypeScript only
          Given all code must be TypeScript
      """
    Then charter "code-standards" should exist in "deepractice"

  # ===== establish =====

  @establish
  Scenario: Establish creates a position
    When I establish position "cto" in "deepractice" with:
      """
      Feature: CTO Duties
        Scenario: Technical leadership
          Given lead technical architecture
      """
    Then position "cto" should exist in "deepractice"

  # ===== assign =====

  @assign
  Scenario: Assign adds duty to position
    Given position "cto" exists in "deepractice"
    When I assign duty "architecture" to "deepractice/cto" with:
      """
      Feature: Architecture Duty
        Scenario: System design
          Given design system architecture
      """
    Then the result should contain "duty: architecture"

  # ===== hire =====

  @hire
  Scenario: Hire adds member to org
    When I hire "alice" into "deepractice"
    Then "alice" should be a member of "deepractice"

  @hire
  Scenario: Hire duplicate member fails
    Given "alice" is a member of "deepractice"
    When I hire "alice" into "deepractice"
    Then it should fail with "already"

  # ===== appoint =====

  @appoint
  Scenario: Appoint assigns role to position
    Given "alice" is a member of "deepractice"
    And position "cto" exists in "deepractice"
    When I appoint "alice" to "deepractice/cto"
    Then "alice" should be assigned to "deepractice/cto"

  # ===== directory =====

  @directory
  Scenario: Directory lists members and positions
    Given "alice" is a member of "deepractice"
    And "bob" is a member of "deepractice"
    And position "cto" exists in "deepractice"
    And "alice" is assigned to "deepractice/cto"
    When I query directory of "deepractice"
    Then the result should contain "alice"
    And the result should contain "bob"
    And the result should contain "cto"

  # ===== dismiss =====

  @dismiss
  Scenario: Dismiss removes role from position
    Given position "engineer" exists in "deepractice"
    And "bob" is assigned to "deepractice/engineer"
    When I dismiss "bob" from "deepractice/engineer"
    Then "bob" should not be assigned to "deepractice/engineer"

  # ===== fire =====

  @fire
  Scenario: Fire removes member and auto-dismisses from positions
    Given position "engineer" exists in "deepractice"
    And "bob" is a member of "deepractice"
    And "bob" is assigned to "deepractice/engineer"
    When I fire "bob" from "deepractice"
    Then "bob" should not be a member of "deepractice"
    And "bob" should not be assigned to "deepractice/engineer"

  # ===== abolish =====

  @abolish
  Scenario: Abolish removes position
    Given position "engineer" exists in "deepractice"
    When I abolish position "engineer" in "deepractice"
    Then position "engineer" should be shadowed in "deepractice"
