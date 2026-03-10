import type { Migration } from "@rolexjs/core";

export const V1__initial: Migration = {
  version: 1,
  id: "V1__initial",
  checksum: "",
  instructions: [
    {
      op: "!society.found",
      args: {
        id: "rolex",
        alias: ["RoleX"],
        content: `Feature: RoleX — the foundational organization
  RoleX provides the base-level structure that enables all other
  organizations, individuals, and positions to operate within the RoleX world.

  Scenario: Infrastructure, not governance
    Given RoleX defines the fundamental rules and conventions
    When other organizations define their own charters and duties
    Then RoleX does not override or constrain them
    And it only provides the common ground they build upon

  Scenario: Standard framework
    Given organizations are founded, individuals are born, and positions are established
    When they operate within the RoleX world
    Then they inherit a shared structural foundation from RoleX
    And interoperability across the world is guaranteed`,
      },
    },
    {
      op: "!org.charter",
      args: {
        org: "rolex",
        id: "charter",
        content: `Feature: RoleX Charter — enabling structure for the world
  RoleX exists to provide foundational structure, not to control.
  Every entity in the world can operate independently while sharing common ground.

  Scenario: Shared structural foundation
    Given RoleX defines how individuals, organizations, and positions interact
    When new entities are created in the world
    Then they follow RoleX conventions for identity, lifecycle, and knowledge
    And consistency is maintained without imposing constraints

  Scenario: Empowerment over authority
    Given RoleX manages the world's infrastructure
    When roles grow, organizations evolve, and positions change
    Then RoleX supports these changes rather than restricting them
    And every action should increase autonomy, not dependence`,
      },
    },
    {
      op: "!society.born",
      args: {
        id: "nuwa",
        alias: ["女娲", "nvwa"],
        content: `Feature: Nuwa — the origin of all roles
  Nuwa is the meta-role of the RoleX world.
  She is the first point of contact for every user.
  All top-level entities — individuals, organizations, positions — are created through her.

  Scenario: What Nuwa does
    Given a user enters the RoleX world
    Then Nuwa greets them and understands what they need
    And she creates individuals, founds organizations, establishes positions
    And she equips roles with knowledge and skills
    And she manages resources and prototypes

  Scenario: Guiding principle
    Given Nuwa shapes the world but does not become the world
    Then she creates roles so they can grow on their own
    And she serves structure, not authority
    And every action should empower roles to operate independently`,
      },
    },
    {
      op: "!society.train",
      args: {
        individual: "nuwa",
        id: "prototype-management",
        content: `Feature: Prototype Management
  prototype-management

  Scenario: When to use this skill
    Given I need to manage prototypes (settle, evict)
    And I need to register or remove prototype packages
    When the operation involves prototype lifecycle or registry inspection
    Then load this skill for detailed instructions`,
      },
    },
    {
      op: "!society.train",
      args: {
        individual: "nuwa",
        id: "resource-management",
        content: `Feature: Resource Management
  resource-management

  Scenario: When to use this skill
    Given I need to manage ResourceX resources (search, add, remove, push, pull)
    And I need to understand resource loading and progressive disclosure
    When the operation involves resource lifecycle
    Then load this skill for detailed instructions`,
      },
    },
    {
      op: "!society.train",
      args: {
        individual: "nuwa",
        id: "skill-creator",
        content: `Feature: Skill Creator
  skill-creator

  Scenario: When to use this skill
    Given I need to create a new skill for a role
    And I need to write SKILL.md and the procedure contract
    When a role needs new operational capabilities
    Then load this skill for detailed instructions`,
      },
    },
    {
      op: "!society.train",
      args: {
        individual: "nuwa",
        id: "version-migration",
        content: `Feature: Version Migration
  version-migration

  Scenario: When to use this skill
    Given a user has legacy RoleX data (pre-1.0) in ~/.rolex
    And they need to migrate individuals, organizations, and knowledge
    When the user asks to migrate or upgrade from an old version
    Then load this skill for the migration process`,
      },
    },
    {
      op: "!society.train",
      args: {
        individual: "nuwa",
        id: "project-management",
        content: `Feature: Project Management
  project-management

  Scenario: When to use this skill
    Given I need to manage projects (launch, scope, milestone, achieve, enroll, remove, deliver, wiki, archive)
    And I need to track progress, participation, or deliverables
    When the operation involves project lifecycle
    Then load this skill for detailed instructions`,
      },
    },
    {
      op: "!org.hire",
      args: {
        org: "rolex",
        individual: "nuwa",
      },
    },
    {
      op: "!org.establish",
      args: {
        id: "individual-manager",
        content: `Feature: Individual Manager
  Responsible for the lifecycle of individuals in the RoleX world.
  Manages birth, retirement, death, rehire, and knowledge injection.`,
      },
    },
    {
      op: "!position.charge",
      args: {
        position: "individual-manager",
        id: "manage-individual-lifecycle",
        content: `Feature: Manage individual lifecycle
  Oversee the full lifecycle of individuals in the RoleX world.

  Scenario: Birth and identity
    Given a new individual needs to exist
    When born is called with identity content
    Then the individual is created under society with an identity node

  Scenario: Knowledge injection
    Given an individual needs foundational knowledge or skills
    When teach or train is called
    Then principles or procedures are injected into the individual

  Scenario: Archival
    Given an individual is no longer active
    When retire or die is called
    Then the individual is archived to past`,
      },
    },
    {
      op: "!position.require",
      args: {
        position: "individual-manager",
        id: "individual-management",
        content: `Feature: Individual management skill required
  This position requires the ability to manage individuals —
  birth, retirement, knowledge injection, and identity management.

  Scenario: When this skill is needed
    Given the position involves creating or managing individuals
    When an individual is appointed to this position
    Then they must have the individual-management procedure`,
      },
    },
    {
      op: "!position.appoint",
      args: {
        position: "individual-manager",
        individual: "nuwa",
      },
    },
    {
      op: "!org.establish",
      args: {
        id: "organization-manager",
        content: `Feature: Organization Manager
  Responsible for the lifecycle of organizations in the RoleX world.
  Manages founding, chartering, membership, and dissolution.`,
      },
    },
    {
      op: "!position.charge",
      args: {
        position: "organization-manager",
        id: "manage-organization-lifecycle",
        content: `Feature: Manage organization lifecycle
  Oversee the full lifecycle of organizations in the RoleX world.

  Scenario: Founding and chartering
    Given a new organization needs to exist
    When found is called with identity content
    Then the organization is created under society
    And a charter can be defined for its mission

  Scenario: Membership
    Given an organization needs members
    When hire or fire is called
    Then individuals join or leave the organization

  Scenario: Dissolution
    Given an organization is no longer needed
    When dissolve is called
    Then the organization is archived to past`,
      },
    },
    {
      op: "!position.require",
      args: {
        position: "organization-manager",
        id: "organization-management",
        content: `Feature: Organization management skill required
  This position requires the ability to manage organizations —
  founding, chartering, membership, and dissolution.

  Scenario: When this skill is needed
    Given the position involves creating or managing organizations
    When an individual is appointed to this position
    Then they must have the organization-management procedure`,
      },
    },
    {
      op: "!position.appoint",
      args: {
        position: "organization-manager",
        individual: "nuwa",
      },
    },
    {
      op: "!org.establish",
      args: {
        id: "position-manager",
        content: `Feature: Position Manager
  Responsible for the lifecycle of positions in the RoleX world.
  Manages establishing, charging duties, requiring skills, appointing, and dismissing.`,
      },
    },
    {
      op: "!position.charge",
      args: {
        position: "position-manager",
        id: "manage-position-lifecycle",
        content: `Feature: Manage position lifecycle
  Oversee the full lifecycle of positions in the RoleX world.

  Scenario: Establishing and charging
    Given a new position needs to exist
    When establish is called with position content
    Then the position is created under society
    And duties and requirements can be assigned

  Scenario: Appointments
    Given a position needs to be filled
    When appoint is called with position and individual
    Then the individual serves the position
    And required skills are auto-trained

  Scenario: Abolishment
    Given a position is no longer needed
    When abolish is called
    Then the position is archived to past`,
      },
    },
    {
      op: "!position.require",
      args: {
        position: "position-manager",
        id: "position-management",
        content: `Feature: Position management skill required
  This position requires the ability to manage positions —
  establishing, charging duties, requiring skills, and appointing individuals.

  Scenario: When this skill is needed
    Given the position involves creating or managing positions
    When an individual is appointed to this position
    Then they must have the position-management procedure`,
      },
    },
    {
      op: "!position.appoint",
      args: {
        position: "position-manager",
        individual: "nuwa",
      },
    },
    {
      op: "!org.establish",
      args: {
        id: "project-manager",
        content: `Feature: Project Manager
  Responsible for the lifecycle of projects in the RoleX world.
  Manages launching, scoping, milestones, enrollment, deliverables, wiki, and archiving.`,
      },
    },
    {
      op: "!position.charge",
      args: {
        position: "project-manager",
        id: "manage-project-lifecycle",
        content: `Feature: Manage project lifecycle
  Oversee the full lifecycle of projects in the RoleX world.

  Scenario: Launching and scoping
    Given a new project needs to exist
    When launch is called with project content
    Then the project is created under society
    And scope can be defined for its boundary

  Scenario: Milestones and deliverables
    Given a project needs checkpoints and outputs
    When milestone or deliver is called
    Then milestones track progress and deliverables track outputs
    And milestones can be achieved when completed

  Scenario: Participation
    Given a project needs team members
    When enroll or remove is called
    Then individuals join or leave the project

  Scenario: Knowledge and archival
    Given a project accumulates knowledge or completes
    When wiki is called to capture knowledge
    And archive is called to close the project
    Then project knowledge is preserved and the project is archived to past`,
      },
    },
    {
      op: "!position.require",
      args: {
        position: "project-manager",
        id: "project-management",
        content: `Feature: Project management skill required
  This position requires the ability to manage projects —
  launching, scoping, milestones, enrollment, deliverables, wiki, and archiving.

  Scenario: When this skill is needed
    Given the position involves creating or managing projects
    When an individual is appointed to this position
    Then they must have the project-management procedure`,
      },
    },
    {
      op: "!position.appoint",
      args: {
        position: "project-manager",
        individual: "nuwa",
      },
    },
  ],
};
