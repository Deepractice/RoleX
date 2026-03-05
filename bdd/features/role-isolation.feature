@role-isolation
Feature: Role isolation
  Each Role is a self-contained operation domain for one individual.
  Focus, goals, plans, and cognitive state must never leak between individuals.

  Background:
    Given a fresh Rolex instance
    And individual "nuwa" exists with goal "setup-cto"
    And individual "sean" exists with goal "mcp-args"

  # ===== focus isolation =====

  Scenario: Focus without args returns own goal
    When I activate role "nuwa"
    And I focus without args
    Then focusedGoalId should be "setup-cto"
    And the output should contain "(setup-cto)"

  Scenario: Focus cannot target another individual's goal
    When I activate role "nuwa"
    Then focus on "mcp-args" should fail with ownership error

  Scenario: Switching individuals restores correct focus
    Given I activate role "sean"
    And I focus on "mcp-args"
    When I activate role "nuwa"
    And I focus without args
    Then focusedGoalId should be "setup-cto"

  # ===== goal isolation =====

  Scenario: Want creates goal under own individual only
    When I activate role "nuwa"
    And I want goal "new-goal" with "Feature: New goal"
    Then "new-goal" should be under individual "nuwa"
    And "new-goal" should not be under individual "sean"

  # ===== persistence isolation =====

  Scenario: Persisted focus does not leak across individuals
    Given I activate role "sean"
    And I focus on "mcp-args"
    And role "sean" is persisted
    When I activate role "nuwa"
    And I focus without args
    Then focusedGoalId should be "setup-cto"
    And focusedGoalId should not be "mcp-args"

  Scenario: Restore from KV returns correct individual state
    Given I activate role "sean"
    And I focus on "mcp-args"
    And role "sean" is persisted
    When I restore role "sean" from KV
    Then focusedGoalId should be "mcp-args"
    When I restore role "nuwa" from KV
    Then focusedGoalId should be "setup-cto"
