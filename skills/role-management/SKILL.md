---
name: role-management
description: Manage role lifecycle in the RoleX system. Use when you need to create roles (born), teach knowledge patterns (teach), train skills/procedures (train), retire roles (retire), or permanently destroy roles (kill). This skill covers all Role System operations — external actions done TO a role, not BY the role.
---

Feature: Role Lifecycle
The Role System manages roles from the outside — create, cultivate, and remove.
These are external operations, not first-person actions.

Scenario: Create a role with born
Given you need a new role in the system
When you call born with a name and persona source
Then a new role structure is created
And the persona is stored as the role's identity foundation
And example:
"""
rolex role born <name> --source 'Feature: <Name>
<Background description>

        Scenario: Core identity
          Given I am <Name>
          Then <personality and values>

        Scenario: Working style
          Given I am working on a task
          Then <how I approach work>'
      """
    And alternatively use --file (-f) to provide a .feature file

Scenario: Verify after born
Given a role has been created with born
When I need to verify the result
Then I use explore to check the role exists in the RoleX world
And I use explore with the role name to inspect the persona content
And I never check the filesystem directly — storage is a platform concern

Scenario: Persona design principles
Given the persona defines who the role is
Then it should include core identity — personality, values, background
And working style — how the role approaches problems
And keep it concise — persona is always loaded at identity time
And write in first person within Scenarios — "Given I am...", "Then I..."

Feature: Knowledge Cultivation
Teach knowledge patterns and train procedures to develop a role's capabilities.

Scenario: Teach a knowledge pattern
Given you want to give a role transferable principles
When you call teach with roleId, name, and source
Then a knowledge.pattern is added to the role's identity
And it will be loaded every time the role activates via identity
And example:
"""
rolex role teach <roleId> <name> --source 'Feature: <Pattern Name>
<Description of the pattern>

        Scenario: <Principle>
          Given <context>
          When <condition>
          Then <insight>'
      """
    And use teach for principles the role should always carry
    And do NOT use teach for operational procedures — use train instead

Scenario: Train a procedure (skill)
Given you want to give a role an operational capability
When you call train with roleId, name, and source
Then a knowledge.procedure is added to the role's identity
And the Feature description MUST contain the path to the SKILL.md file
And the procedure summary is loaded at identity time
And the full SKILL.md is loaded on demand via the skill process
And example:
"""
rolex role train <roleId> <name> --source 'Feature: <Skill Name>
/absolute/path/to/skills/<skill-name>/SKILL.md

        Scenario: What this skill does
          Given I need to <capability>
          Then I can <operations>'
      """

Scenario: When to teach vs train
Given teach and train serve different purposes
Then teach is for knowledge.pattern — transferable principles, always loaded
And train is for knowledge.procedure — operational skills, loaded on demand
And teach adds to what the role knows and thinks about
And train adds to what the role can do

Feature: Role Removal
Retire or permanently destroy roles that are no longer needed.

Scenario: Retire a role
Given a role should be deactivated but preserved
When you call retire with the role name
Then the role's persona gets a @retired tag
And the role's data is preserved but marked inactive
And example:
"""
rolex role retire <name>
"""
And use retire when the role may be needed again later

Scenario: Kill a role
Given a role should be permanently destroyed
When you call kill with the role name
Then the role's entire structure is removed from the platform
And this action is irreversible — all identity, goals, and history are deleted
And example:
"""
rolex role kill <name>
"""
And use kill only when you are certain the role is no longer needed
And consider retire first if there is any doubt
