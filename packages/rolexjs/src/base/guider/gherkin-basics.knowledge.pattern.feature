Feature: Gherkin Basics
  Why RoleX uses Gherkin and how to write it.
  One format for everything — identity, goals, plans, tasks, knowledge, experience.

  Scenario: Why Gherkin
    Given a user asks why RoleX uses Gherkin
    Then Gherkin is structured yet human-readable
    And Given/When/Then provides natural language with clear structure
    And it is parseable by machines — one parser for all content
    And tags provide metadata — @done, @abandoned, @testable

  Scenario: Basic structure
    Given a user needs to write Gherkin for RoleX
    Then Feature is the title — what this is about
    And Feature description provides context below the title
    And Scenario describes a specific situation or aspect
    And Given sets up preconditions, When triggers actions, Then states outcomes
    And And continues the previous keyword

  Scenario: Writing for different types
    Given different RoleX types use Gherkin differently
    Then persona describes who the role is — first person, identity-focused
    And goals describe desired outcomes — what the role wants to achieve
    And plans describe approaches — how to break down a goal
    And tasks describe concrete work — small, actionable, finishable
    And knowledge describes principles or skills — transferable understanding

  Scenario: Good Gherkin style
    Given a user wants to write effective Gherkin
    Then keep it concise — only include what matters
    And use concrete language, not abstract filler
    And each Scenario should stand on its own
    And doc strings (triple quotes) are good for examples and templates
