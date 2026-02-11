Feature: assign
  Write or update duty for a position.

  Scenario: Assign a duty
    Given a position exists within an organization
    When I call assign with the position name, duty name, and Gherkin source
    Then the duty entry is created or updated under the position
