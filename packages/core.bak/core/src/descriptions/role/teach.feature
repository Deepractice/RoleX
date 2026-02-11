Feature: teach
  Teach a role abstract, first-principles knowledge.

  Scenario: Transmit knowledge
    Given a role exists
    When I call teach with a type (knowledge, experience, or voice) and Gherkin source
    Then the information is added to the role's identity
    And the role can access it at identity time
