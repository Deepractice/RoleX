Feature: achieve — mark a milestone as done
  Mark a project milestone as achieved.
  The milestone is completed and its status is updated.

  Scenario: Achieve a milestone
    Given a milestone exists within a project
    When achieve is called on the milestone
    Then the milestone is marked as done

  Scenario: Parameters
    Given the command is project.achieve
    Then milestone is required — the milestone's id
