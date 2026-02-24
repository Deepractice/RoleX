Feature: forget — remove a node from the individual
  Remove any node under the individual by its id.
  Use forget to discard outdated knowledge, stale encounters, or obsolete skills.

  Scenario: Forget a node
    Given a node exists under the individual (principle, procedure, experience, encounter, etc.)
    When forget is called with the node's id
    Then the node and its subtree are removed
    And the individual no longer carries that knowledge or record

  Scenario: When to use forget
    Given a principle has become outdated or incorrect
    And a procedure references a skill that no longer exists
    And an encounter or experience has no further learning value
    When the role decides to discard it
    Then call forget with the node id
