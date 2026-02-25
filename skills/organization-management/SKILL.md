---
name: organization-management
description: Manage organizations and positions — founding, chartering, membership, duties, requirements, appointments, and dissolution.
---

Feature: Organization Lifecycle
  Manage the full lifecycle of organizations in the RoleX world.
  Organizations group individuals via membership and can have a charter.

  Scenario: found — create an organization
    Given you want to create a new organization
    When you call use with !org.found
    Then a new organization node is created under society
    And individuals can be hired into it
    And a charter can be defined for it
    And parameters are:
      """
      use("!org.found", {
        content: "Feature: Deepractice\n  An AI agent framework company",
        id: "dp",
        alias: ["deepractice"]    // optional
      })
      """

  Scenario: charter — define the organization's mission
    Given an organization needs a formal mission and governance
    When you call use with !org.charter
    Then the charter is stored under the organization
    And parameters are:
      """
      use("!org.charter", {
        org: "dp",
        content: "Feature: Build great AI\n  Scenario: Mission\n    Given we believe AI agents need identity\n    Then we build frameworks for role-based agents"
      })
      """

  Scenario: dissolve — dissolve an organization
    Given an organization is no longer needed
    When you call use with !org.dissolve
    Then the organization is archived to past
    And parameters are:
      """
      use("!org.dissolve", { org: "dp" })
      """

Feature: Membership
  Manage who belongs to an organization.
  Membership is a link between organization and individual.

  Scenario: hire — add a member
    Given an individual should join an organization
    When you call use with !org.hire
    Then a membership link is created between the organization and the individual
    And the individual can then be appointed to positions
    And parameters are:
      """
      use("!org.hire", { org: "dp", individual: "sean" })
      """

  Scenario: fire — remove a member
    Given an individual should leave an organization
    When you call use with !org.fire
    Then the membership link is removed
    And parameters are:
      """
      use("!org.fire", { org: "dp", individual: "sean" })
      """

Feature: Position Lifecycle
  Manage the full lifecycle of positions in the RoleX world.
  Positions are independent entities that can be charged with duties
  and linked to individuals via appointment.

  Scenario: establish — create a position
    Given you want to define a new role or position
    When you call use with !position.establish
    Then a new position entity is created under society
    And it can be charged with duties and individuals can be appointed to it
    And parameters are:
      """
      use("!position.establish", {
        content: "Feature: Backend Architect\n  Responsible for system design and API architecture",
        id: "architect"
      })
      """

  Scenario: charge — assign a duty to a position
    Given a position needs specific responsibilities defined
    When you call use with !position.charge
    Then a duty node is created under the position
    And individuals appointed to this position inherit the duty
    And parameters are:
      """
      use("!position.charge", {
        position: "architect",
        content: "Feature: Design systems\n  Scenario: API design\n    Given a new service is needed\n    Then design the API contract first",
        id: "design-systems"
      })
      """

  Scenario: require — declare a required skill for a position
    Given a position requires individuals to have specific skills
    When you call use with !position.require
    Then a requirement node is created under the position
    And individuals appointed to this position will automatically receive the skill
    And upserts by id — if the same id exists, it replaces the old one
    And parameters are:
      """
      use("!position.require", {
        position: "architect",
        content: "Feature: System Design\n  Scenario: When to apply\n    Given a new service is planned\n    Then design the architecture before coding",
        id: "system-design"
      })
      """

  Scenario: abolish — abolish a position
    Given a position is no longer needed
    When you call use with !position.abolish
    Then the position is archived to past
    And parameters are:
      """
      use("!position.abolish", { position: "architect" })
      """

Feature: Appointment
  Manage who holds a position.
  Appointment is a link between position and individual.

  Scenario: appoint — assign an individual to a position
    Given an individual should hold a position
    When you call use with !position.appoint
    Then an appointment link is created between the position and the individual
    And all required skills (from require) are automatically trained into the individual
    And existing skills with the same id are replaced (upsert)
    And parameters are:
      """
      use("!position.appoint", { position: "architect", individual: "sean" })
      """

  Scenario: dismiss — remove an individual from a position
    Given an individual should no longer hold a position
    When you call use with !position.dismiss
    Then the appointment link is removed
    And parameters are:
      """
      use("!position.dismiss", { position: "architect", individual: "sean" })
      """

Feature: Common Workflows

  Scenario: Full organization setup with positions
    Given you need an organization with positions and members
    Then follow this sequence:
      """
      1. use("!org.found", { id: "dp", content: "Feature: Deepractice" })
      2. use("!org.charter", { org: "dp", content: "Feature: Mission\n  ..." })
      3. use("!position.establish", { id: "architect", content: "Feature: Architect" })
      4. use("!position.charge", { position: "architect", content: "Feature: Design\n  ...", id: "design" })
      5. use("!position.require", { position: "architect", content: "Feature: Skill\n  ...", id: "skill" })
      6. use("!org.hire", { org: "dp", individual: "sean" })
      7. use("!position.appoint", { position: "architect", individual: "sean" })
      """
    And step 7 appoint will auto-train the required skill into sean
