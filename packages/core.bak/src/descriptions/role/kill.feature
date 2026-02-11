Feature: kill
  Permanently destroy a role and all its data.

  Scenario: Kill a role
    Given a role exists and should be permanently removed
    When I call kill with the role name
    Then the role node and all children are deleted from the graph
    And all associated content is removed
