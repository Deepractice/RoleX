@journey @growth
Feature: Growth Loop
  The learning cycle: achieve → reflect → contemplate.
  Experience.insight becomes knowledge.pattern becomes knowledge.theory.

  Background:
    Given a fresh RoleX platform
    And role "learner" exists with persona "I am a learner"
    And I call identity for "learner"

  Scenario: Full growth loop — from experience to theory
    # Phase 1: Accumulate insights through multiple goal cycles

    # Goal 1: Build a web app
    When I want "build-webapp" with:
      """
      Feature: Build Web App
        Scenario: Ship it
          Given build and deploy a web app
      """
    And I design "webapp-plan" with:
      """
      Feature: Web App Plan
        Scenario: Steps
          Given setup Next.js project
      """
    And I todo "setup-next" with:
      """
      Feature: Setup Next
        Scenario: Init
          Given run create-next-app
      """
    And I finish "setup-next"
    And I achieve with experience "webapp-insight":
      """
      Feature: Web App Insight
        Scenario: Learned
          Given Next.js App Router simplifies server components
          And convention over configuration saves setup time
      """
    Then experience.insight "webapp-insight" should exist

    # Goal 2: Build an API
    When I want "build-api" with:
      """
      Feature: Build API
        Scenario: Ship it
          Given build and deploy a REST API
      """
    And I design "api-plan" with:
      """
      Feature: API Plan
        Scenario: Steps
          Given setup Hono server
      """
    And I todo "setup-hono" with:
      """
      Feature: Setup Hono
        Scenario: Init
          Given create Hono app
      """
    And I finish "setup-hono"
    And I achieve with experience "api-insight":
      """
      Feature: API Insight
        Scenario: Learned
          Given Hono's middleware pattern is clean
          And convention-based routing reduces boilerplate
      """
    Then experience.insight "api-insight" should exist

    # Phase 2: Reflect — distill insights into knowledge.pattern
    When I reflect on "webapp-insight", "api-insight" to produce "framework-principles" with:
      """
      Feature: Framework Principles
        Scenario: Convention over configuration
          Given convention-based approaches consistently reduce setup time
          And they make codebases more predictable
        Scenario: Middleware patterns
          Given layered middleware provides clean separation of concerns
      """
    Then knowledge.pattern "framework-principles" should exist
    And experience.insight "webapp-insight" should be consumed
    And experience.insight "api-insight" should be consumed

    # Goal 3: Build a CLI tool
    When I want "build-cli" with:
      """
      Feature: Build CLI
        Scenario: Ship it
          Given build a developer CLI tool
      """
    And I design "cli-plan" with:
      """
      Feature: CLI Plan
        Scenario: Steps
          Given setup citty commands
      """
    And I todo "setup-cli" with:
      """
      Feature: Setup CLI
        Scenario: Init
          Given scaffold command structure
      """
    And I finish "setup-cli"
    And I achieve with experience "cli-insight":
      """
      Feature: CLI Insight
        Scenario: Learned
          Given auto-derived commands from definitions eliminate boilerplate
          And single source of truth pattern applies to CLIs too
      """

    # Reflect again with new insight + existing pattern
    When I reflect on "cli-insight" to produce "derivation-principles" with:
      """
      Feature: Derivation Principles
        Scenario: Auto-derivation
          Given when definitions are the source of truth
          Then multiple interfaces can be auto-derived
          And boilerplate is eliminated
      """
    Then knowledge.pattern "derivation-principles" should exist

    # Phase 3: Contemplate — unify patterns into theory
    When I contemplate on "framework-principles", "derivation-principles" to produce "software-philosophy" with:
      """
      Feature: Software Philosophy
        Scenario: Convention and derivation
          Given conventions establish predictable structure
          And derivation eliminates repetitive translation
          Then together they produce minimal yet powerful systems
      """
    Then knowledge.theory "software-philosophy" should exist
    And knowledge.pattern "framework-principles" should still exist
    And knowledge.pattern "derivation-principles" should still exist

  Scenario: Forget prunes outdated knowledge
    Given I have knowledge.pattern "old-pattern" with:
      """
      Feature: Old Pattern
        Scenario: Outdated
          Given this is no longer relevant
      """
    When I forget knowledge.pattern "old-pattern"
    Then knowledge.pattern "old-pattern" should not exist
