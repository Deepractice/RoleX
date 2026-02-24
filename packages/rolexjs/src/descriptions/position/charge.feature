Feature: charge — assign duty to a position
  Assign a duty to a position.
  Duties describe the responsibilities and expectations of a position.

  Scenario: Charge a position with duty
    Given a position exists within an organization
    And a Gherkin source describing the duty
    When charge is called on the position with a duty id
    Then the duty is stored as the position's information
    And individuals appointed to this position inherit the duty

  Scenario: Duty ID convention
    Given the id is keywords from the duty content joined by hyphens
    Then "Design systems" becomes id "design-systems"
    And "Review pull requests" becomes id "review-pull-requests"

  Scenario: Writing the duty Gherkin
    Given the duty defines responsibilities for a position
    Then the Feature title names the duty or responsibility
    And Scenarios describe specific obligations, deliverables, or expectations
    And the tone is prescriptive — what must be done, not what could be done
