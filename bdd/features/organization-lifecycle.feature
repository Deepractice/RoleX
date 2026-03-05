@organization
Feature: Organization lifecycle
  Found, charter, hire, fire, dissolve.

  Background:
    Given a fresh Rolex instance

  # ===== found =====

  Scenario: Found creates an organization
    When I direct "!org.found" with:
      | content | Feature: Deepractice |
      | id      | deepractice          |
    Then the result process should be "found"
    And the result state name should be "organization"
    And the result state id should be "deepractice"
    And organization "deepractice" should exist

  # ===== charter =====

  Scenario: Charter defines organization mission
    Given organization "deepractice" exists
    When I direct "!org.charter" with:
      | org     | deepractice             |
      | content | Feature: Build AI tools |
      | id      | dp-charter              |
    Then the result process should be "charter"
    And the result state name should be "charter"

  # ===== hire =====

  Scenario: Hire adds individual to organization
    Given individual "sean" exists
    And organization "deepractice" exists
    When I direct "!org.hire" with:
      | org        | deepractice |
      | individual | sean        |
    Then the result process should be "hire"

  # ===== fire =====

  Scenario: Fire removes individual from organization
    Given individual "sean" exists
    And organization "deepractice" exists
    And "sean" is hired into "deepractice"
    When I direct "!org.fire" with:
      | org        | deepractice |
      | individual | sean        |
    Then the result process should be "fire"

  # ===== dissolve =====

  Scenario: Dissolve archives an organization
    Given organization "deepractice" exists
    When I direct "!org.dissolve" with:
      | org | deepractice |
    Then the result process should be "dissolve"
    And the result state name should be "organization"
