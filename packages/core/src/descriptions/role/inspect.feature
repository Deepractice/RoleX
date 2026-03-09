Feature: inspect — examine any node's full state tree
  Project a node's complete subtree including children and links.
  Works without an active role — a stateless observation tool.

  Scenario: Inspect a node
    Given a node id is provided
    When inspect is called with the id
    Then the full state tree is projected from that node downward
    And output uses heading + Gherkin format (same as activate)
