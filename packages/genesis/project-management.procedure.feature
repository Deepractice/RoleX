Feature: Project Management
  project-management

  Scenario: When to use this skill
    Given I need to manage projects (launch, scope, milestone, achieve, enroll, remove, deliver, wiki, archive)
    And I need to track progress, participation, or deliverables
    When the operation involves project lifecycle
    Then load this skill for detailed instructions
