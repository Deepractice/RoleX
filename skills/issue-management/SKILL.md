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
    When I call use with !issue.publish
    Then a new issue is created with auto-incremented number
    And status defaults to "open"
    And optional: assignee can be set at creation
    And parameters are:
      """
      command: "!issue.publish"
      args:
        title: "Issue title"
        body: "Issue description"
        author: "individual-id"
        assignee: "other-id"   # optional
      """

  Scenario: Get issue details
    Given I need to view a specific issue
    When I call use with !issue.get
    Then the full issue is returned including labels
    And parameters are:
      """
      command: "!issue.get"
      args:
        number: 1
      """

  Scenario: List issues with filters
    Given I need to browse issues
    When I call use with !issue.list
    Then matching issues are returned ordered by number descending
    And all filter parameters are optional — omit for all issues
    And parameters are:
      """
      command: "!issue.list"
      args:
        status: "open"        # optional
        author: "id"          # optional
        assignee: "id"        # optional
        label: "bug"          # optional
      """

  Scenario: Update an issue
    Given I need to change an issue's title, body, or assignee
    When I call use with !issue.update
    Then the specified fields are updated
    And parameters are:
      """
      command: "!issue.update"
      args:
        number: 1
        title: "New title"    # optional
        body: "New body"      # optional
        assignee: "id"        # optional
      """

  Scenario: Close an issue
    Given an issue is resolved
    When I call use with !issue.close
    Then status changes to "closed" and closedAt is set
    And parameters are:
      """
      command: "!issue.close"
      args:
        number: 1
      """

  Scenario: Reopen an issue
    Given a closed issue needs more work
    When I call use with !issue.reopen
    Then status changes back to "open" and closedAt is cleared
    And parameters are:
      """
      command: "!issue.reopen"
      args:
        number: 1
      """

  Scenario: Assign an issue
    Given I need to assign an issue to another individual
    When I call use with !issue.assign
    Then the issue's assignee is updated
    And parameters are:
      """
      command: "!issue.assign"
      args:
        number: 1
        assignee: "individual-id"
      """

Feature: Comment Commands
  Commands for adding and viewing comments on issues.

  Scenario: Add a comment
    Given I want to discuss an issue
    When I call use with !issue.comment
    Then a comment is added to the issue
    And parameters are:
      """
      command: "!issue.comment"
      args:
        number: 1
        body: "Comment text"
        author: "individual-id"
      """

  Scenario: List comments
    Given I want to see the discussion on an issue
    When I call use with !issue.comments
    Then all comments are returned ordered by creation time
    And parameters are:
      """
      command: "!issue.comments"
      args:
        number: 1
      """

Feature: Label Commands
  Commands for labeling and unlabeling issues.

  Scenario: Add a label to an issue
    Given I want to categorize an issue
    When I call use with !issue.label
    Then the label is attached to the issue
    And if the label doesn't exist yet, it is auto-created
    And parameters are:
      """
      command: "!issue.label"
      args:
        number: 1
        label: "bug"
      """

  Scenario: Remove a label from an issue
    Given I want to recategorize an issue
    When I call use with !issue.unlabel
    Then the label is removed from the issue
    And parameters are:
      """
      command: "!issue.unlabel"
      args:
        number: 1
        label: "bug"
      """

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
