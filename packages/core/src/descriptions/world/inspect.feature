Feature: Inspect — examine any node's full state
  Inspect is the top-level perception tool for examining any node in detail.
  Given a node id, it projects the complete subtree with all children and links.
  It works without an active role — it is a stateless observation.

  Scenario: Inspect any node
    Given I need to understand a product, project, organization, or any node
    When I call inspect(id)
    Then the full state tree is projected from that node downward
    And output includes heading, Gherkin content, children, and links

  Scenario: Granularity is flexible
    Given inspect works on any node, not just top-level entities
    When I inspect a plan, a goal, or even a task
    Then only that subtree is rendered
    And this allows zooming into any level of detail

  Scenario: Inspect vs activate
    Given activate is for becoming a role (subject transformation)
    When inspect is used instead
    Then I observe the node without becoming it
    And no role context is created or changed
    And inspect is read-only observation, activate is identity assumption
