@cognition
Feature: Cognition loop
  reflect → realize/master: encounters become experience, then principles or procedures.

  Background:
    Given a fresh Rolex instance
    And individual "sean" exists
    And I activate role "sean"
    And I want goal "auth" with "Feature: Auth"
    And I plan "jwt" with "Feature: JWT"
    And I todo "login" with "Feature: Login"

  # ===== reflect =====

  Scenario: Reflect consumes encounter and produces experience
    Given I finish "login" with encounter "Feature: Login done\n  Scenario: OK\n    Given login\n    Then success"
    When I reflect on "login-finished" as "token-insight" with "Feature: Token insight\n  Scenario: Learned\n    Given tokens\n    Then refresh matters"
    Then the output should contain "[experience]"
    And encounter "login-finished" should be consumed
    And experience "token-insight" should be registered

  Scenario: Reflect without encounter creates experience directly
    When I reflect directly as "conv-insight" with "Feature: Conversation insight\n  Scenario: Learned\n    Given discussion\n    Then clarity"
    Then the output should contain "[experience]"
    And experience "conv-insight" should be registered
    And encounter count should be 0

  # ===== realize =====

  Scenario: Realize distills experience into a principle
    Given I finish "login" with encounter "Feature: Login done\n  Scenario: OK\n    Given login\n    Then success"
    And I reflect on "login-finished" as "token-insight" with "Feature: Token insight\n  Scenario: Learned\n    Given tokens\n    Then refresh"
    When I realize from "token-insight" as "always-refresh" with "Feature: Always use refresh tokens\n  Scenario: Rule\n    Given tokens expire\n    Then refresh tokens must exist"
    Then the output should contain "[principle]"
    And experience "token-insight" should be consumed

  Scenario: Realize without experience creates principle directly
    When I realize directly as "test-first" with "Feature: Always test first\n  Scenario: Rule\n    Given code changes\n    Then write tests first"
    Then the output should contain "[principle]"
    And experience count should be 0

  # ===== master =====

  Scenario: Master creates a procedure from experience
    Given I finish "login" with encounter "Feature: Login done\n  Scenario: OK\n    Given login\n    Then success"
    And I reflect on "login-finished" as "jwt-insight" with "Feature: JWT insight\n  Scenario: Learned\n    Given jwt\n    Then patterns"
    When I master from "jwt-insight" as "jwt-skill" with "Feature: JWT mastery\n  Scenario: Skill\n    Given auth needed\n    Then apply JWT pattern"
    Then the output should contain "[procedure]"
    And experience "jwt-insight" should be consumed

  Scenario: Master without experience creates procedure directly
    When I master directly as "code-review" with "Feature: Code review\n  Scenario: Skill\n    Given PR submitted\n    Then review systematically"
    Then the output should contain "[procedure]"

  # ===== forget =====

  Scenario: Forget removes a knowledge node
    Given I finish "login" with encounter "Feature: Login done\n  Scenario: OK\n    Given login\n    Then success"
    And I reflect on "login-finished" as "my-insight" with "Feature: Insight\n  Scenario: Learned\n    Given x\n    Then y"
    And I realize from "my-insight" as "my-principle" with "Feature: My principle\n  Scenario: Rule\n    Given a\n    Then b"
    When I forget "my-principle"
    Then the output should contain "forgotten"
