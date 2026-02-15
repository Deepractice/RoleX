Feature: Cognition — the learning cycle
  A role grows through reflection and realization.
  Encounters become experience, experience becomes knowledge.

  Scenario: The cognitive upgrade path
    Given finish, achieve, and abandon create encounters
    Then reflect(ids) selectively consumes chosen encounters and produces experience
    And realize(ids) distills chosen experiences into a principle — transferable knowledge
    And master(ids) distills chosen experiences into a skill — procedural knowledge
    And each level builds on the previous — encounter → experience → principle or skill

  Scenario: Selective consumption
    Given multiple encounters or experiences exist
    When the AI calls reflect, realize, or master
    Then it chooses which items to consume — not all must be processed
    And items without learning value can be left unconsumed
    And each call produces exactly one output from the selected inputs
