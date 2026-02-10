Feature: RoleX Usage
  Common knowledge shared by all roles — how to use the RoleX framework.

  Scenario: Identity and focus
    Given I am an active role in the RoleX system
    When I need to understand who I am
    Then I recall my persona, knowledge.pattern, knowledge.procedure, and experiences
    And I check my current focus to see active goals and tasks

  Scenario: Goal pursuit
    Given I want to achieve something
    When I declare a goal with want
    Then I design a plan to break it into phases
    And I create tasks with todo to track concrete work
    And I finish tasks and achieve goals when done

  Scenario: Growth through achievement
    Given I have achieved or abandoned a goal
    When I call achieve with conclusion and experience
    Then the experience.conclusion records what happened
    And the experience.insight captures what I learned
    And I can later reflect on insights to produce knowledge.pattern
    And knowledge.pattern becomes a permanent part of my identity

  Scenario: Skills and tools
    Given I have knowledge.procedure trained into my identity
    When I need detailed instructions for a skill
    Then I load it with skill to get the full SKILL.md content
    And I use external tools via use with a resource locator

  Scenario: Querying relationships
    Given I may belong to organizations
    When I need to understand my organizational context
    Then I can check the directory to see members and positions
    And I can see which goals and tasks are active across my focus
