@execution
Feature: Execution loop
  want → plan → todo → finish → complete/abandon through the Role API.
  All operations return rendered 3-layer text (status + hint + projection).

  Background:
    Given a fresh Rolex instance
    And individual "sean" exists
    And I activate role "sean"

  # ===== want =====

  Scenario: Want declares a goal
    When I want goal "build-auth" with "Feature: Build authentication"
    Then the output should contain "Goal"
    And the output should contain "[goal]"
    And the output should contain "(build-auth)"
    And focusedGoalId should be "build-auth"

  # ===== plan =====

  Scenario: Plan creates a plan under the focused goal
    Given I want goal "auth" with "Feature: Auth"
    When I plan "jwt-strategy" with "Feature: JWT strategy"
    Then the output should contain "[plan]"
    And the output should contain "(jwt-strategy)"
    And focusedPlanId should be "jwt-strategy"

  # ===== todo =====

  Scenario: Todo adds a task to the focused plan
    Given I want goal "auth" with "Feature: Auth"
    And I plan "jwt" with "Feature: JWT"
    When I todo "write-tests" with "Feature: Write tests"
    Then the output should contain "[task]"
    And the output should contain "(write-tests)"

  # ===== finish =====

  Scenario: Finish with encounter records an encounter
    Given I want goal "auth" with "Feature: Auth"
    And I plan "jwt" with "Feature: JWT"
    And I todo "login" with "Feature: Login"
    When I finish "login" with encounter "Feature: Login done\n  Scenario: OK\n    Given login\n    Then success"
    Then the output should contain "[encounter]"
    And encounter "login-finished" should be registered

  Scenario: Finish without encounter does not register
    Given I want goal "auth" with "Feature: Auth"
    And I plan "jwt" with "Feature: JWT"
    And I todo "login" with "Feature: Login"
    When I finish "login" without encounter
    Then the output should contain "finished"
    And encounter count should be 0

  # ===== complete =====

  Scenario: Complete closes a plan and records encounter
    Given I want goal "auth" with "Feature: Auth"
    And I plan "jwt" with "Feature: JWT"
    When I complete plan "jwt" with encounter "Feature: JWT done\n  Scenario: OK\n    Given jwt\n    Then done"
    Then the output should contain "[encounter]"
    And encounter "jwt-completed" should be registered
    And focusedPlanId should be null

  # ===== abandon =====

  Scenario: Abandon drops a plan and records encounter
    Given I want goal "auth" with "Feature: Auth"
    And I plan "jwt" with "Feature: JWT"
    When I abandon plan "jwt" with encounter "Feature: JWT failed\n  Scenario: Not viable\n    Given jwt complexity\n    Then switched approach"
    Then the output should contain "[encounter]"
    And the output should contain "abandoned"

  # ===== focus =====

  Scenario: Focus switches between goals
    Given I want goal "goal-a" with "Feature: Goal A"
    And I want goal "goal-b" with "Feature: Goal B"
    When I focus on "goal-a"
    Then the output should contain "(goal-a)"
    And focusedGoalId should be "goal-a"
