Feature: Cognition — the learning cycle
  A role grows through reflection and realization.
  Encounters become experience, experience becomes knowledge.

  Scenario: The cognitive upgrade path
    Given finish, achieve, and abandon create encounters
    Then reflect(ids, experience) selectively consumes chosen encounters and produces experience
    And realize(ids, principle) distills chosen experiences into a principle — transferable knowledge
    And master(ids, procedure) distills chosen experiences into a procedure — skill metadata
    And each level builds on the previous — encounter → experience → principle or procedure

  Scenario: Selective consumption
    Given multiple encounters or experiences exist
    When the AI calls reflect, realize, or master
    Then it chooses which items to consume — not all must be processed
    And items without learning value can be left unconsumed
    And each call produces exactly one output from the selected inputs
