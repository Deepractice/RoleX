Feature: Cognition — the learning cycle
  A role grows through reflection and realization.
  Encounters become experience, experience becomes principles and procedures.
  Knowledge can also be injected externally via teach and train.

  Scenario: The cognitive upgrade path
    Given finish, complete, and abandon create encounters
    Then reflect(ids, id, experience) selectively consumes chosen encounters and produces experience
    And realize(ids, id, principle) distills chosen experiences into a principle — transferable knowledge
    And master(ids, id, procedure) distills chosen experiences into a procedure — skill metadata
    And master can also be called without ids — the role masters directly from external information
    And each level builds on the previous — encounter → experience → principle or procedure

  Scenario: External injection
    Given an external agent needs to equip a role with knowledge or skills
    Then teach(individual, principle, id) directly injects a principle
    And train(individual, procedure, id) directly injects a procedure
    And the difference from realize/master is perspective — external vs self-initiated
    And teach is the external counterpart of realize
    And train is the external counterpart of master

  Scenario: Selective consumption
    Given multiple encounters or experiences exist
    When the AI calls reflect, realize, or master
    Then it chooses which items to consume — not all must be processed
    And items without learning value can be left unconsumed
    And each call produces exactly one output from the selected inputs
