@individual-system
Feature: Individual System
  First-person cognition — the AI agent's operating system.
  14 processes: identity, focus, explore, want, design, todo, finish, achieve, abandon, forget, reflect, contemplate.

  Background:
    Given a fresh RoleX platform
    And role "sean" exists with persona "I am Sean"
    And role "sean" has knowledge.pattern "typescript"
    And role "sean" has knowledge.procedure "code-review"

  # ===== identity =====

  @identity
  Scenario: Identity loads role cognition
    When I call identity for "sean"
    Then the result should contain "identity loaded"
    And the result should contain "I am Sean"
    And the result should contain "typescript"
    And the result should contain "code-review"

  @identity
  Scenario: Identity for non-existent role fails
    When I call identity for "ghost"
    Then it should fail with "not found"

  # ===== want =====

  @want
  Scenario: Want declares a new goal
    Given I am "sean"
    When I want "build-mvp" with:
      """
      Feature: Build MVP
        Scenario: Ship v1
          Given I need a working product
      """
    Then goal "build-mvp" should exist
    And focus should be on "build-mvp"

  @want
  Scenario: Want auto-switches focus to new goal
    Given I am "sean"
    And I have goal "goal-a"
    When I want "goal-b" with:
      """
      Feature: Goal B
        Scenario: Second
          Given a second goal
      """
    Then focus should be on "goal-b"

  # ===== focus =====

  @focus
  Scenario: Focus shows current goal with full content
    Given I am "sean"
    And I have goal "build-mvp" with plan "mvp-plan" and task "setup-db"
    When I call focus
    Then the result should contain "Feature: build-mvp"
    And the result should contain "Feature: mvp-plan"
    And the result should contain "Feature: setup-db"

  @focus
  Scenario: Focus switches to another goal by name
    Given I am "sean"
    And I have goal "goal-a"
    And I have goal "goal-b"
    When I call focus with name "goal-a"
    Then the result should contain "goal: goal-a"

  @focus
  Scenario: Focus shows other goals list
    Given I am "sean"
    And I have goal "goal-a"
    And I have goal "goal-b"
    When I call focus
    Then the result should contain "Other goals: goal-a"

  # ===== explore =====

  @explore
  Scenario: Explore lists all roles and orgs
    Given I am "sean"
    And role "bob" exists
    And org "acme" exists
    When I call explore
    Then the result should contain "acme (org)"
    And the result should contain "bob"
    And the result should contain "sean"

  @explore
  Scenario: Explore by name shows role detail
    Given I am "sean"
    And role "bob" exists with persona "I am Bob"
    When I call explore with name "bob"
    Then the result should contain "I am Bob"

  @explore
  Scenario: Explore by name shows org detail
    Given I am "sean"
    And org "acme" exists with charter "We build AI tools"
    When I call explore with name "acme"
    Then the result should contain "We build AI tools"

  @explore
  Scenario: Explore non-existent entity fails
    Given I am "sean"
    When I call explore with name "nonexistent"
    Then it should fail with "not found"

  # ===== design =====

  @design
  Scenario: Design creates a plan under focused goal
    Given I am "sean"
    And I have goal "build-mvp"
    When I design "mvp-plan" with:
      """
      Feature: MVP Plan
        Scenario: Phase 1
          Given setup the database
      """
    Then plan "mvp-plan" should exist under goal "build-mvp"

  @design
  Scenario: Multiple plans — latest is focused
    Given I am "sean"
    And I have goal "build-mvp"
    When I design "plan-a" with:
      """
      Feature: Plan A
        Scenario: Approach A
          Given try approach A
      """
    And I design "plan-b" with:
      """
      Feature: Plan B
        Scenario: Approach B
          Given try approach B
      """
    Then focused plan should be "plan-b"

  # ===== todo =====

  @todo
  Scenario: Todo creates task under focused plan
    Given I am "sean"
    And I have goal "build-mvp" with plan "mvp-plan"
    When I todo "setup-db" with:
      """
      Feature: Setup DB
        Scenario: Create tables
          Given I run migrations
      """
    Then task "setup-db" should exist under plan "mvp-plan"

  @todo
  Scenario: Todo without plan fails
    Given I am "sean"
    And I have goal "build-mvp" without plan
    When I todo "orphan" with:
      """
      Feature: Orphan
        Scenario: Lost
          Given no plan
      """
    Then it should fail with "No plan"

  # ===== finish =====

  @finish
  Scenario: Finish marks task as done
    Given I am "sean"
    And I have goal "build-mvp" with plan "mvp-plan" and task "setup-db"
    When I finish "setup-db"
    Then task "setup-db" should be marked @done

  @finish
  Scenario: Finish with conclusion writes experience.conclusion
    Given I am "sean"
    And I have goal "build-mvp" with plan "mvp-plan" and task "setup-db"
    When I finish "setup-db" with conclusion:
      """
      Feature: DB Done
        Scenario: Result
          Given migrations ran successfully
      """
    Then task "setup-db" should be marked @done
    And conclusion "setup-db" should exist

  # ===== achieve =====

  @achieve
  Scenario: Achieve completes goal with experience
    Given I am "sean"
    And I have a finished goal "build-mvp"
    When I achieve with experience "mvp-learning":
      """
      Feature: MVP Learning
        Scenario: Key insight
          Given ship fast beats perfection
      """
    Then goal "build-mvp" should be marked @done
    And experience.insight "mvp-learning" should exist
    And conclusions should be consumed

  # ===== abandon =====

  @abandon
  Scenario: Abandon marks goal as abandoned
    Given I am "sean"
    And I have goal "bad-idea"
    When I abandon
    Then goal "bad-idea" should be marked @abandoned

  @abandon
  Scenario: Abandon with experience captures learning
    Given I am "sean"
    And I have goal "bad-idea"
    When I abandon with experience "failed-lesson":
      """
      Feature: Failed Lesson
        Scenario: What I learned
          Given validate assumptions first
      """
    Then goal "bad-idea" should be marked @abandoned
    And experience.insight "failed-lesson" should exist

  # ===== reflect =====

  @reflect
  Scenario: Reflect distills insights into knowledge.pattern
    Given I am "sean"
    And I have experience.insight "insight-a"
    And I have experience.insight "insight-b"
    When I reflect on "insight-a", "insight-b" to produce "principles" with:
      """
      Feature: Principles
        Scenario: Key lessons
          Given test early and ship fast
      """
    Then knowledge.pattern "principles" should exist
    And experience.insight "insight-a" should be consumed
    And experience.insight "insight-b" should be consumed

  # ===== contemplate =====

  @contemplate
  Scenario: Contemplate unifies patterns into theory
    Given I am "sean"
    And I have knowledge.pattern "pattern-a"
    And I have knowledge.pattern "pattern-b"
    When I contemplate on "pattern-a", "pattern-b" to produce "unified-theory" with:
      """
      Feature: Unified Theory
        Scenario: Big picture
          Given everything connects
      """
    Then knowledge.theory "unified-theory" should exist
    And knowledge.pattern "pattern-a" should still exist
    And knowledge.pattern "pattern-b" should still exist

  # ===== forget =====

  @forget
  Scenario: Forget removes knowledge.pattern
    Given I am "sean"
    And I have knowledge.pattern "outdated"
    When I forget knowledge.pattern "outdated"
    Then knowledge.pattern "outdated" should not exist

  @forget
  Scenario: Forget removes experience.insight
    Given I am "sean"
    And I have experience.insight "stale-insight"
    When I forget experience.insight "stale-insight"
    Then experience.insight "stale-insight" should not exist
