Feature: teach — inject external principle
  Directly inject a principle into an individual.
  Unlike realize which consumes experience, teach requires no prior encounters.
  Use teach to equip a role with a known, pre-existing principle.

  Scenario: Teach a principle
    Given an individual exists
    When teach is called with individual id, principle Gherkin, and a principle id
    Then a principle is created directly under the individual
    And no experience or encounter is consumed

  Scenario: Principle ID convention
    Given the id is keywords from the principle content joined by hyphens
    Then "Always validate expiry" becomes id "always-validate-expiry"
    And "Structure first design" becomes id "structure-first-design"

  Scenario: When to use teach vs realize
    Given realize distills internal experience into a principle
    And teach injects an external, pre-existing principle
    When a role needs knowledge it has not learned through experience
    Then use teach to inject the principle directly
    When a role has gained experience and wants to codify it
    Then use realize to distill it into a principle

  Scenario: Writing the principle Gherkin
    Given the principle is the same format as realize output
    Then the Feature title states the principle as a general rule
    And Scenarios describe different situations where this principle applies
    And the tone is universal — no mention of specific projects, tasks, or people
