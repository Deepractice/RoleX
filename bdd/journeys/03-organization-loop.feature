@journey @organization
Feature: Organization Loop
  Full org lifecycle: found → rule → establish → hire → appoint → work → dismiss → fire → abolish → dissolve.

  Background:
    Given a fresh RoleX platform
    And role "alice" exists with persona "I am Alice the PM"
    And role "bob" exists with persona "I am Bob the engineer"
    And role "charlie" exists with persona "I am Charlie the designer"

  Scenario: Full organization lifecycle
    # Step 1: Found organization
    When I found org "startup" with:
      """
      Feature: Startup Charter
        Scenario: Mission
          Given we build innovative AI products
      """
    Then org "startup" should exist

    # Step 2: Write rules (charter entries)
    When I rule "startup" charter "values" with:
      """
      Feature: Company Values
        Scenario: Core values
          Given move fast and ship often
          And user experience above all
      """
    Then charter "values" should exist in "startup"

    # Step 3: Establish positions
    When I establish position "cto" in "startup" with:
      """
      Feature: CTO
        Scenario: Responsibilities
          Given lead technical architecture and engineering team
      """
    And I establish position "engineer" in "startup" with:
      """
      Feature: Engineer
        Scenario: Responsibilities
          Given build and maintain product features
      """
    And I establish position "designer" in "startup" with:
      """
      Feature: Designer
        Scenario: Responsibilities
          Given design user interfaces and experiences
      """
    Then position "cto" should exist in "startup"
    And position "engineer" should exist in "startup"
    And position "designer" should exist in "startup"

    # Step 4: Hire members
    When I hire "alice" into "startup"
    And I hire "bob" into "startup"
    And I hire "charlie" into "startup"
    Then "alice" should be a member of "startup"
    And "bob" should be a member of "startup"
    And "charlie" should be a member of "startup"

    # Step 5: Appoint to positions
    When I appoint "alice" to "startup/cto"
    And I appoint "bob" to "startup/engineer"
    And I appoint "charlie" to "startup/designer"
    Then "alice" should be assigned to "startup/cto"
    And "bob" should be assigned to "startup/engineer"
    And "charlie" should be assigned to "startup/designer"

    # Step 6: Verify directory
    When I query directory of "startup"
    Then the result should contain "alice"
    And the result should contain "bob"
    And the result should contain "charlie"
    And the result should contain "cto"
    And the result should contain "engineer"
    And the result should contain "designer"

    # Step 7: Dismiss from position (role change)
    When I dismiss "bob" from "startup/engineer"
    And I appoint "bob" to "startup/cto"
    Then "bob" should not be assigned to "startup/engineer"
    And "bob" should be assigned to "startup/cto"

    # Step 8: Fire member (auto-dismisses)
    When I fire "charlie" from "startup"
    Then "charlie" should not be a member of "startup"
    And "charlie" should not be assigned to "startup/designer"

    # Step 9: Abolish unused position
    When I abolish position "designer" in "startup"
    Then position "designer" should be shadowed in "startup"

    # Step 10: Dissolve organization
    When I dissolve org "startup"
    Then org "startup" should be shadowed
