---
name: skill-creator
description: Guide for creating RoleX skills. Use when creating a new skill or updating an existing skill that extends a role's capabilities. Skills are SKILL.md files referenced by knowledge.procedure — the procedure summary is loaded at identity time, the full SKILL.md is loaded on demand via the skill process.
---

Feature: RoleX Skill Creator
Create skills that follow the RoleX capability system.
A skill is a SKILL.md file referenced by a knowledge.procedure entry via ResourceX locator.
Progressive disclosure: procedure summary at identity → full SKILL.md via skill(locator) → execution via use.

Scenario: What is a RoleX skill
Given a role needs operational capabilities beyond its identity
Then a skill is a SKILL.md file containing detailed instructions
And a knowledge.procedure is a Gherkin summary that references the skill via locator
And the procedure is loaded at identity time — the role knows what skills exist
And the full SKILL.md is loaded on demand via the skill process

Scenario: Skill directory structure
Given a skill lives under the skills/ directory
Then the structure is:
"""
skills/<skill-name>/
├── SKILL.md (required — detailed instructions in Gherkin)
└── references/ (optional — loaded on demand)
└── <topic>.md
"""
And SKILL.md has YAML frontmatter with name and description
And the body uses Gherkin Feature/Scenario format
And references contain domain-specific details loaded only when needed

Scenario: The procedure-skill contract
Given a knowledge.procedure is trained to a role
Then the Feature description contains the ResourceX locator for the skill
And the Feature body summarizes what the skill can do
And example procedure:
"""
Feature: Role Management
deepractice/role-management

        Scenario: What this skill does
          Given I need to manage role lifecycle
          Then I can born, teach, train, retire, and kill roles
      """
    And the description line is the locator — the skill process resolves it via ResourceX

Feature: Skill Creation Process
How to create a new RoleX skill step by step.

Scenario: Step 1 — Understand the scope
Given you are creating a skill for a specific domain
When you analyze what operations the skill should cover
Then identify the concrete commands, parameters, and workflows
And determine what the role needs to know vs what it already knows
And only include information the role cannot infer on its own

Scenario: Step 2 — Write SKILL.md
Given you understand the scope
When you write the SKILL.md
Then start with YAML frontmatter (name + description)
And write the body as Gherkin Features and Scenarios
And each Feature covers a logical group of operations
And each Scenario describes a specific workflow or decision point
And use Given/When/Then for step-by-step procedures
And keep SKILL.md under 500 lines — split into references if needed

Scenario: Step 3 — Create the procedure
Given SKILL.md is written
When you train the procedure to a role
Then use the train command with Gherkin source
And the Feature description MUST be the ResourceX locator for the skill
And the Feature body summarizes capabilities for identity-time awareness

Scenario: Step 4 — Test the skill
Given the procedure is trained
When you call identity to reload
Then the procedure summary should appear in identity output
And calling skill with the procedure name should load the full SKILL.md
And the loaded content should be actionable and complete

Feature: SKILL.md Writing Guidelines
Rules for writing effective skill content in Gherkin.

Scenario: Context window is a shared resource
Given the SKILL.md is loaded into the AI's context window
Then keep content concise — only include what the role cannot infer
And prefer concrete examples over verbose explanations
And use Gherkin structure to organize — not to pad length

Scenario: Gherkin as instruction format
Given RoleX uses Gherkin as its universal language
When writing SKILL.md body content
Then use Feature for logical groups of related operations
And use Scenario for specific workflows or procedures
And use Given for preconditions and context
And use When for actions and triggers
And use Then for expected outcomes and next steps
And use doc strings (triple quotes) for command examples and templates

Scenario: Progressive disclosure within a skill
Given a skill may cover many operations
When some details are only needed in specific situations
Then keep core workflows in SKILL.md
And move detailed reference material to references/ files
And reference them from SKILL.md with clear "when to read" guidance

Scenario: Frontmatter requirements
Given the frontmatter is the triggering mechanism
Then name must match the procedure name
And description must explain what the skill does AND when to use it
And do not include other fields in frontmatter
