@journey @execution
Feature: Execution Loop
  The complete goal pursuit cycle: identity → want → design → todo → finish → achieve.
  This is the core loop that drives all productive work in RoleX.

  Background:
    Given a fresh RoleX platform
    And role "dev" exists with persona "I am a developer"

  Scenario: Full execution loop — from identity to achievement
    # Step 1: Activate identity
    When I call identity for "dev"
    Then the result should contain "identity loaded"

    # Step 2: Declare a goal
    When I want "ship-feature" with:
      """
      Feature: Ship Feature
        Scenario: Deliver user auth
          Given the product needs user authentication
      """
    Then focus should be on "ship-feature"

    # Step 3: Design a plan
    When I design "auth-plan" with:
      """
      Feature: Auth Plan
        Scenario: Phase 1 — Backend
          Given implement JWT token service
        Scenario: Phase 2 — Frontend
          Given add login UI
      """
    Then plan "auth-plan" should exist under goal "ship-feature"

    # Step 4: Create tasks
    When I todo "jwt-service" with:
      """
      Feature: JWT Service
        Scenario: Token generation
          Given implement sign and verify methods
      """
    And I todo "login-ui" with:
      """
      Feature: Login UI
        Scenario: Login form
          Given create email + password form
      """
    Then task "jwt-service" should exist under plan "auth-plan"
    And task "login-ui" should exist under plan "auth-plan"

    # Step 5: Finish tasks
    When I finish "jwt-service" with conclusion:
      """
      Feature: JWT Done
        Scenario: Result
          Given JWT service implemented with RS256
      """
    And I finish "login-ui"
    Then task "jwt-service" should be marked @done
    And task "login-ui" should be marked @done

    # Step 6: Achieve goal
    When I achieve with experience "auth-experience":
      """
      Feature: Auth Experience
        Scenario: Key learning
          Given RS256 is better than HS256 for distributed systems
          And always validate token expiry on the server side
      """
    Then goal "ship-feature" should be marked @done
    And experience.insight "auth-experience" should exist
    And conclusions should be consumed

  Scenario: Execution loop with abandonment
    When I call identity for "dev"
    And I want "bad-idea" with:
      """
      Feature: Bad Idea
        Scenario: Premature optimization
          Given optimize the database before any users exist
      """
    And I design "opt-plan" with:
      """
      Feature: Optimization Plan
        Scenario: Phase 1
          Given add caching layer
      """
    And I todo "add-redis" with:
      """
      Feature: Add Redis
        Scenario: Setup
          Given install and configure Redis
      """

    # Realize it's premature — abandon
    When I abandon with experience "premature-lesson":
      """
      Feature: Premature Lesson
        Scenario: Insight
          Given don't optimize before measuring
          And premature optimization is the root of all evil
      """
    Then goal "bad-idea" should be marked @abandoned
    And experience.insight "premature-lesson" should exist

  Scenario: Multi-goal switching during execution
    When I call identity for "dev"
    And I want "goal-alpha" with:
      """
      Feature: Goal Alpha
        Scenario: First
          Given build feature alpha
      """
    And I want "goal-beta" with:
      """
      Feature: Goal Beta
        Scenario: Second
          Given build feature beta
      """
    Then focus should be on "goal-beta"

    # Switch focus to alpha
    When I call focus with name "goal-alpha"
    Then the result should contain "goal: goal-alpha"
    And the result should contain "Other goals: goal-beta"

    # Work on alpha
    When I design "alpha-plan" with:
      """
      Feature: Alpha Plan
        Scenario: Steps
          Given implement alpha
      """
    And I todo "alpha-task" with:
      """
      Feature: Alpha Task
        Scenario: Work
          Given do alpha work
      """
    And I finish "alpha-task"
    And I achieve with experience "alpha-insight":
      """
      Feature: Alpha Insight
        Scenario: Learned
          Given alpha taught me X
      """
    Then goal "goal-alpha" should be marked @done

    # Auto-switch to beta (or manual focus)
    When I call focus with name "goal-beta"
    Then the result should contain "goal: goal-beta"
