Feature: die — permanently archive an individual
  Move an individual to the past archive with intent of permanence.
  Technically identical to retire (data is preserved in past), but signals finality.
  Use die when the individual is no longer needed (deprecated role, replaced).

  Scenario: Archive an individual permanently
    Given an individual exists in society
    When die is called on the individual
    Then the individual is moved to the past archive
    And data is preserved but restoration is not intended

  Scenario: Parameters
    Given the command is individual.die
    Then individual is required — the individual's id

  Scenario: retire vs die
    Given both move the individual to past archive
    Then retire signals temporary — may return later
    And die signals permanent — not intended to return
