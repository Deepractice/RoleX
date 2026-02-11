Feature: use
  As a role, I use an external tool by resolving and executing a resource.

  Scenario: Use a tool
    Given a resource locator identifies an executable tool
    When I call use with the locator and optional arguments
    Then the resource is resolved via ResourceX
    And the tool is executed with the provided arguments
    And the result is returned
