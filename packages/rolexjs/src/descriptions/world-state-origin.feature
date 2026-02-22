Feature: State origin — prototype vs instance
  Every node in a role's state tree has an origin: prototype or instance.
  This distinction determines what can be modified and what is read-only.

  Scenario: Prototype nodes are read-only
    Given a node has origin {prototype}
    Then it comes from a position, duty, or organizational definition
    And it is inherited through the membership/appointment chain
    And it CANNOT be modified or forgotten — it belongs to the organization

  Scenario: Instance nodes are mutable
    Given a node has origin {instance}
    Then it was created by the individual through execution or cognition
    And it includes goals, plans, tasks, encounters, experiences, principles, and procedures
    And it CAN be modified or forgotten — it belongs to the individual

  Scenario: Reading the state heading
    Given a state node is rendered as a heading
    Then the format is: [name] (id) {origin}
    And [name] identifies the structure type
    And (id) identifies the specific node
    And {origin} shows prototype or instance
    And nodes without origin have no organizational inheritance

  Scenario: Forget only works on instance nodes
    Given the AI wants to forget a node
    When the node origin is {instance}
    Then forget will succeed — the individual owns this knowledge
    When the node origin is {prototype}
    Then forget will fail — the knowledge belongs to the organization
