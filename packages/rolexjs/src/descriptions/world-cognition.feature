Feature: Cognition — the learning cycle
  A role grows through reflection and realization.
  Encounters become experience, experience becomes principles and procedures.
  These can also be injected externally via teach and train.

  Scenario: The cognitive upgrade path
    Given finish, complete, and abandon create encounters
    Then reflect(ids, id, experience) selectively consumes chosen encounters and produces experience
    And realize(ids, id, principle) distills chosen experiences into a principle — transferable knowledge
    And master(ids, id, procedure) distills chosen experiences into a procedure — skill metadata
    And each level builds on the previous — encounter → experience → principle or procedure

  Scenario: External injection
    Given a role needs knowledge or skills it has not learned through experience
    Then teach(individual, principle, id) directly injects a principle — no experience consumed
    And train(individual, procedure, id) directly injects a procedure — no experience consumed
    And teach is the external counterpart of realize
    And train is the external counterpart of master

  Scenario: Selective consumption
    Given multiple encounters or experiences exist
    When the AI calls reflect, realize, or master
    Then it chooses which items to consume — not all must be processed
    And items without learning value can be left unconsumed
    And each call produces exactly one output from the selected inputs
