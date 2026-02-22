Feature: reflect — encounter to experience
  Consume an encounter and create an experience.
  Experience captures what was learned in structured form.
  This is the first step of the cognition cycle.

  Scenario: Reflect on an encounter
    Given an encounter exists from a finished task or closed goal
    When reflect is called with encounter ids and an experience id
    Then the encounter is consumed
    And an experience is created under the role
    And the experience can be distilled into knowledge via realize or master

  Scenario: Experience ID convention
    Given the id is keywords from the experience content joined by hyphens
    Then "Token refresh matters" becomes id "token-refresh-matters"
    And "ID ownership determines generation strategy" becomes id "id-ownership-determines-generation-strategy"

  Scenario: Writing the experience Gherkin
    Given the experience captures insight — what was learned, not what was done
    Then the Feature title names the cognitive insight or pattern discovered
    And Scenarios describe the learning points abstracted from the concrete encounter
    And the tone shifts from event to understanding — no longer tied to a specific task
