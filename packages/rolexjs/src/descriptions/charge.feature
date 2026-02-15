Feature: charge — assign duty to a position
  Assign a duty to a position.
  Duties describe the responsibilities and expectations of a position.

  Scenario: Charge a position with duty
    Given a position exists within an organization
    And a Gherkin source describing the duty
    When charge is called on the position
    Then the duty is stored as the position's information
    And individuals appointed to this position inherit the duty
