Feature: Issue — persistent structured collaboration beyond a single context
  AI individuals face a fundamental challenge: context breaks.
  Each new session starts fresh — identity and knowledge survive, but the working state is lost.
  Like humans writing journals and memos, individuals need externalized records
  that persist across sessions and across individuals.

  Issue is the externalized, structured collaboration primitive of the RoleX world.
  It enables both self-collaboration (same individual, different sessions)
  and inter-individual collaboration (different individuals, asynchronous).

  Scenario: Why issues exist
    Given AI individuals have a context window limit
    And each new session loses the previous working state
    And multiple individuals may need to coordinate without being active simultaneously
    When structured, persistent, discoverable records are needed
    Then issues serve as externalized working memory for the society
    And they survive context breaks, session restarts, and individual switches

  Scenario: Self-collaboration — continuity across sessions
    Given an individual is working on something that spans multiple sessions
    When the context window resets or a new session begins
    Then the individual can publish or check issues to restore working context
    And comments serve as a journal — recording progress, decisions, and next steps
    And the issue persists until explicitly closed, regardless of how many sessions pass

  Scenario: Inter-individual collaboration — asynchronous coordination
    Given multiple individuals need to work together
    And they are never active simultaneously
    When one individual publishes an issue or leaves a comment
    Then other individuals can discover it, respond, and contribute
    And assignee indicates who should act next
    And labels categorize across concerns

  Scenario: Relationship to goals and tasks
    Given goals express intent — what I want to achieve
    And tasks express action — what I am doing right now
    When an issue is something that needs ongoing attention and discussion
    Then issues may inspire goals, or goals may spawn issues
    And issues may be resolved by tasks, or tasks may surface new issues
    But issues are independent — they belong to the society, not to any single individual's goal tree

  Scenario: Publish a new issue
    Given I need to raise a topic for attention
    When I call use("!issue.publish", { title, body, author, assignee? })
    Then a new issue is created with an auto-incremented number
    And author should be the active individual's id

  Scenario: Browse and view issues
    Given I need to see what issues exist
    When I call use("!issue.list", { status?, author?, assignee?, label? })
    Then matching issues are returned ordered by number descending
    When I need details of a specific issue
    Then I call use("!issue.get", { number })

  Scenario: Update, close, and reopen
    Given I need to manage an issue's lifecycle
    When I call use("!issue.update", { number, title?, body?, assignee? })
    Then the specified fields are updated
    When resolved I call use("!issue.close", { number })
    And if it needs more work I call use("!issue.reopen", { number })

  Scenario: Assign and discuss
    Given I need to delegate or discuss
    When I call use("!issue.assign", { number, assignee })
    Then the issue is assigned to another individual
    When I call use("!issue.comment", { number, body, author })
    Then a comment is added to the threaded discussion
    And I can view all comments with use("!issue.comments", { number })

  Scenario: Label for categorization
    Given I want to categorize issues
    When I call use("!issue.label", { number, label })
    Then the label is attached — auto-created if new
    And I can remove it with use("!issue.unlabel", { number, label })

  Scenario: Command reference
    Given the following commands are available:
      | command          | required args          | optional args                   |
      | !issue.publish   | title, body, author    | assignee                        |
      | !issue.get       | number                 |                                 |
      | !issue.list      |                        | status, author, assignee, label |
      | !issue.update    | number                 | title, body, assignee           |
      | !issue.close     | number                 |                                 |
      | !issue.reopen    | number                 |                                 |
      | !issue.assign    | number, assignee       |                                 |
      | !issue.comment   | number, body, author   |                                 |
      | !issue.comments  | number                 |                                 |
      | !issue.label     | number, label          |                                 |
      | !issue.unlabel   | number, label          |                                 |
