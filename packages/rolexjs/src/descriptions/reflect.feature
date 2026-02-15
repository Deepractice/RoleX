Feature: reflect — encounter to experience
  Consume an encounter and create an experience.
  Experience captures what was learned in structured form.
  This is the first step of the cognition cycle.

  Scenario: Reflect on an encounter
    Given an encounter exists from a finished task or closed goal
    When reflect is called on the encounter
    Then the encounter is consumed
    And an experience is created under the role
    And the experience can be distilled into knowledge via realize or master
