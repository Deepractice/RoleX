---
name: org-management
description: Manage organization lifecycle and governance in the RoleX system. Use when you need to create organizations (found), dissolve them, manage governance (rule, establish, abolish, assign), manage membership (hire, fire), manage appointments (appoint, dismiss), or query organization structure (directory). This skill covers Organization System and Governance System operations.
---

Feature: Organization Lifecycle
The Organization System manages organizations from the outside — create and remove.

Scenario: Create an organization with found
Given you need a new organization in the system
When you call found with a name, charter source, and optional parent
Then a new organization structure is created
And the charter defines the organization's purpose and rules
And example:
"""
rolex org found <name> --source 'Feature: <Org Name>
<Purpose and mission>

        Scenario: Mission
          Given this organization exists
          Then its purpose is <mission>

        Scenario: Core values
          Given members of this organization
          Then they uphold <values>'
      """
    And use --parent to create a sub-organization under an existing one

Scenario: Dissolve an organization
Given an organization should be permanently removed
When you call dissolve with the organization name
Then the organization structure is removed from the platform
And all membership and assignment relations are cleaned up
And this action is irreversible
And example:
"""
rolex org dissolve <name>
"""

Feature: Governance — Charter and Positions
The Governance System manages an organization's internal rules and structure.

Scenario: Update charter with rule
Given you need to add or update an organization's charter entry
When you call rule with orgName, name, and source
Then the charter entry is created or updated
And the charter defines organizational policies, values, and guidelines
And example:
"""
rolex gov rule <orgName> <name> --source 'Feature: <Rule Name>
<Description of the rule>

        Scenario: <Policy>
          Given <context>
          When <condition>
          Then <expected behavior>'
      """

Scenario: Create a position with establish
Given you need a new role position in the organization
When you call establish with orgName, name, and source (duty definition)
Then a new position (duty) is created
And the duty describes what the position is responsible for
And example:
"""
rolex gov establish <orgName> <positionName> --source 'Feature: <Position>
<Responsibilities>

        Scenario: Core responsibility
          Given I hold this position
          Then I am responsible for <duties>'
      """

Scenario: Remove a position with abolish
Given a position is no longer needed
When you call abolish with orgName and position name
Then the position is removed
And all role assignments to this position are automatically dismissed
And example:
"""
rolex gov abolish <orgName> <positionName>
"""

Scenario: Update position duty with assign
Given you need to change what a position is responsible for
When you call assign with positionName, name, and source
Then the duty definition for that position is updated
And example:
"""
rolex gov assign <positionName> <dutyName> --source 'Feature: <Duty>
Scenario: <Responsibility>
Given this duty is assigned
Then <what it requires>'
"""

Feature: Membership Management
Manage who belongs to the organization and who holds which positions.

Scenario: Hire a role into the organization
Given you need to add a role as a member
When you call hire with orgName and roleName
Then a membership relation is established
And the role must already exist (created via born)
And the role can now be appointed to positions in this organization
And example:
"""
rolex gov hire <orgName> <roleName>
"""

Scenario: Fire a role from the organization
Given you need to remove a role from the organization
When you call fire with orgName and roleName
Then the membership relation is removed
And all position assignments for this role are automatically dismissed
And the role's identity remains intact — only the organizational link is severed
And example:
"""
rolex gov fire <orgName> <roleName>
"""

Scenario: Appoint a role to a position
Given a role should hold a specific position
When you call appoint with roleName and positionName
Then an assignment relation is created between the role and the position
And the role must be a member of the organization (hire first)
And example:
"""
rolex gov appoint <roleName> <positionName>
"""

Scenario: Dismiss a role from a position
Given a role should no longer hold a specific position
When you call dismiss with roleName and positionName
Then the assignment relation is removed
And the role remains a member — only the position assignment is removed
And example:
"""
rolex gov dismiss <roleName> <positionName>
"""

Feature: Organization Query
Query the structure and membership of an organization.

Scenario: Query with directory
Given you need to understand an organization's current structure
When you call directory with orgName
Then it returns all members (hired roles)
And all positions (established duties)
And all assignments (who holds which position)
And example:
"""
rolex gov directory <orgName>
"""

Feature: Workflow Patterns
Common patterns for managing organizations.

Scenario: Bootstrap a new organization
Given you are setting up a new organization from scratch
Then step 1: found the organization with a charter
And step 2: establish positions that define the organizational structure
And step 3: hire roles into the organization
And step 4: appoint roles to their positions

Scenario: Restructure an organization
Given you need to change the organizational structure
Then review current structure with directory
And abolish positions that are no longer needed (auto-dismisses assignments)
And establish new positions as needed
And appoint existing members to new positions

Scenario: Offboard a role
Given a role is leaving the organization
Then fire the role (auto-dismisses all position assignments)
And the role's identity and knowledge remain intact
And the role can be re-hired later if needed
