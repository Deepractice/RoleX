Feature: abolish — abolish a position
  Move a position to the past archive.
  The position and its subtree (duties, requirements) are archived, not deleted.

  Scenario: Abolish a position
    Given a position exists in society
    When abolish is called on the position
    Then the position is moved to the past archive
    And the position's subtree (duties, requirements) is preserved in past

  Scenario: Parameters
    Given the command is org.abolish
    Then position is required — the position's id
