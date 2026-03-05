---
name: project-management
description: Manage project lifecycle — launching, scoping, milestones, enrollment, deliverables, wiki, and archiving. Use when you need to create or manage projects, track progress, or coordinate participation.
---

Feature: Project Lifecycle
  Manage the full lifecycle of projects in the RoleX world.
  Projects are top-level organizational units with scope, milestones, deliverables, and participation.

  Scenario: launch — create a new project
    Given you want to start a new project
    When you call use with !project.launch
    Then a new project node is created under society
    And the project can be scoped, have milestones, and enroll participants
    And parameters are:
      """
      command: "!project.launch"
      args:
        content: "Feature: My Project\n  A project to build something great"
        id: "my-project"
      """

  Scenario: scope — define project boundary
    Given a project needs a clear boundary or focus area
    When you call use with !project.scope
    Then a scope node is created under the project
    And parameters are:
      """
      command: "!project.scope"
      args:
        project: "my-project"
        content: "Feature: MVP Scope\n  Scenario: Core features\n    Given we focus on essentials\n    Then build auth, dashboard, and API"
        id: "mvp-scope"
      """

  Scenario: archive — close a project
    Given a project is completed or no longer needed
    When you call use with !project.archive
    Then the project is archived to past
    And all data is preserved
    And parameters are:
      """
      command: "!project.archive"
      args:
        project: "my-project"
      """

Feature: Milestones
  Track project progress through milestones.
  Milestones are checkpoints that can be achieved when completed.

  Scenario: milestone — create a milestone
    Given a project needs progress checkpoints
    When you call use with !project.milestone
    Then a milestone node is created under the project
    And parameters are:
      """
      command: "!project.milestone"
      args:
        project: "my-project"
        content: "Feature: Alpha Release\n  Scenario: Criteria\n    Given core features are implemented\n    Then deploy to staging"
        id: "alpha-release"
      """

  Scenario: achieve — mark a milestone as done
    Given a milestone's criteria have been met
    When you call use with !project.achieve
    Then the milestone is marked as achieved
    And parameters are:
      """
      command: "!project.achieve"
      args:
        milestone: "alpha-release"
      """

Feature: Participation
  Manage who participates in a project.
  Participation links individuals to projects.

  Scenario: enroll — add a participant
    Given an individual should join a project
    When you call use with !project.enroll
    Then the individual becomes a participant of the project
    And parameters are:
      """
      command: "!project.enroll"
      args:
        project: "my-project"
        individual: "sean"
      """

  Scenario: remove — remove a participant
    Given an individual should leave a project
    When you call use with !project.remove
    Then the individual is removed from the project
    And parameters are:
      """
      command: "!project.remove"
      args:
        project: "my-project"
        individual: "sean"
      """

Feature: Deliverables and Wiki
  Track outputs and capture knowledge within a project.

  Scenario: deliver — record a deliverable
    Given a project produces a concrete output
    When you call use with !project.deliver
    Then a deliverable node is created under the project
    And parameters are:
      """
      command: "!project.deliver"
      args:
        project: "my-project"
        content: "Feature: API v1\n  Scenario: What was delivered\n    Given the REST API is complete\n    Then all endpoints are documented and tested"
        id: "api-v1"
      """

  Scenario: wiki — capture project knowledge
    Given a project accumulates knowledge worth preserving
    When you call use with !project.wiki
    Then a wiki entry is created under the project
    And parameters are:
      """
      command: "!project.wiki"
      args:
        project: "my-project"
        content: "Feature: Architecture Decisions\n  Scenario: Why we chose X\n    Given option A and option B existed\n    Then we chose A because of performance"
        id: "architecture-decisions"
      """

Feature: Common Workflows

  Scenario: Full project setup
    Given you need a complete project with scope and milestones
    Then follow this sequence:
      """
      1. command: "!project.launch", args: { id: "my-project", content: "Feature: ..." }
      2. command: "!project.scope", args: { project: "my-project", content: "Feature: ...", id: "scope" }
      3. command: "!project.milestone", args: { project: "my-project", content: "Feature: ...", id: "m1" }
      4. command: "!project.enroll", args: { project: "my-project", individual: "sean" }
      """

  Scenario: Complete a project
    Given a project is done
    Then the sequence is:
      """
      1. command: "!project.achieve", args: { milestone: "final-milestone" }
      2. command: "!project.deliver", args: { project: "my-project", content: "Feature: ...", id: "final" }
      3. command: "!project.wiki", args: { project: "my-project", content: "Feature: ...", id: "lessons" }
      4. command: "!project.archive", args: { project: "my-project" }
      """
