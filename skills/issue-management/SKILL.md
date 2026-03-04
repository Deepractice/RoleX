---
name: issue-management
description: Manage issues between individuals using IssueX. Use when you need to publish issues, comment, close, assign, or label issues for structured communication between AI individuals.
---

Feature: IssueX Concepts
  IssueX is the issue tracking system for RoleX individuals.
  It follows the GitHub Issues model — issues, comments, and labels.
  Issues enable structured asynchronous communication between individuals.

  Scenario: What is an issue
    Given an issue is a titled piece of structured communication
    Then it has a number (auto-increment, like GitHub #1 #2)
    And it has a title, body, status (open/closed), author, and optional assignee
    And it can have labels for categorization
    And it can have comments for threaded discussion

  Scenario: Author is the active role
    Given the author field identifies which individual published the issue
    When using issue commands through a role
    Then the author should be the active individual's id

Feature: Issue Lifecycle Commands
  Commands for creating, viewing, updating, and closing issues.

  Scenario: Publish a new issue
    Given I need to create a new issue
    When I call use("!issue.publish", { title, body, author })
    Then a new issue is created with auto-incremented number
    And status defaults to "open"
    And optional: assignee can be set at creation

  Scenario: Get issue details
    Given I need to view a specific issue
    When I call use("!issue.get", { number })
    Then the full issue is returned including labels

  Scenario: List issues with filters
    Given I need to browse issues
    When I call use("!issue.list", { status?, author?, assignee?, label? })
    Then matching issues are returned ordered by number descending
    And all filter parameters are optional — omit for all issues

  Scenario: Update an issue
    Given I need to change an issue's title, body, or assignee
    When I call use("!issue.update", { number, title?, body?, assignee? })
    Then the specified fields are updated

  Scenario: Close an issue
    Given an issue is resolved
    When I call use("!issue.close", { number })
    Then status changes to "closed" and closedAt is set

  Scenario: Reopen an issue
    Given a closed issue needs more work
    When I call use("!issue.reopen", { number })
    Then status changes back to "open" and closedAt is cleared

  Scenario: Assign an issue
    Given I need to assign an issue to another individual
    When I call use("!issue.assign", { number, assignee })
    Then the issue's assignee is updated

Feature: Comment Commands
  Commands for adding and viewing comments on issues.

  Scenario: Add a comment
    Given I want to discuss an issue
    When I call use("!issue.comment", { number, body, author })
    Then a comment is added to the issue

  Scenario: List comments
    Given I want to see the discussion on an issue
    When I call use("!issue.comments", { number })
    Then all comments are returned ordered by creation time

Feature: Label Commands
  Commands for labeling and unlabeling issues.

  Scenario: Add a label to an issue
    Given I want to categorize an issue
    When I call use("!issue.label", { number, label })
    Then the label is attached to the issue
    And if the label doesn't exist yet, it is auto-created

  Scenario: Remove a label from an issue
    Given I want to recategorize an issue
    When I call use("!issue.unlabel", { number, label })
    Then the label is removed from the issue

Feature: Command Reference
  Quick reference for all issue commands.

  Scenario: All commands
    Given the following commands are available:
      | command          | required args          | optional args            |
      | !issue.publish   | title, body, author    | assignee                 |
      | !issue.get       | number                 |                          |
      | !issue.list      |                        | status, author, assignee, label |
      | !issue.update    | number                 | title, body, assignee    |
      | !issue.close     | number                 |                          |
      | !issue.reopen    | number                 |                          |
      | !issue.assign    | number, assignee       |                          |
      | !issue.comment   | number, body, author   |                          |
      | !issue.comments  | number                 |                          |
      | !issue.label     | number, label          |                          |
      | !issue.unlabel   | number, label          |                          |
