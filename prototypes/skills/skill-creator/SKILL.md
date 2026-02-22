Feature: Skill Creator — Guide for creating RoleX skills
  Create effective skills for RoleX roles using Gherkin Feature format.
  Use this skill when a role needs to create a new skill or update an existing one.

  Scenario: What is a RoleX skill
    Given a skill is a reusable capability that extends a role
    And skills are written as Gherkin Feature files
    And skills are packaged as ResourceX resources
    Then a skill provides procedural knowledge a role can load on demand
    And skills follow progressive disclosure — metadata first, full content when needed

  Scenario: Skill directory structure
    Given a skill is a ResourceX resource
    Then the directory contains
      | file              | required | purpose                              |
      | resource.json     | yes      | ResourceX source marker              |
      | SKILL.md     | yes      | Main skill instructions in Gherkin   |
      | references/       | no       | Reference .feature files loaded on demand |
      | scripts/          | no       | Executable scripts for deterministic tasks |
      | assets/           | no       | Templates and files used in output   |

  Scenario: resource.json format
    Given the resource.json marks this as a ResourceX source
    Then it contains
      | field       | example                                    |
      | name        | my-skill                                   |
      | type        | skill                                      |
      | tag         | 0.1.0                                      |
      | author      | deepractice                                |
      | description | What this skill does and when to trigger it |
    And description is the primary trigger — it tells the role when to use this skill

  Scenario: Writing SKILL.md
    Given the Feature title names the capability
    And the Feature description explains what it does and when to use it
    When writing scenarios
    Then each Scenario describes a distinct procedure or workflow
    And Given establishes the context or precondition
    And When describes the trigger or action
    And Then describes the expected outcome or steps to follow
    And Data Tables provide structured reference data

  Scenario: Gherkin over Markdown
    Given RoleX uses Gherkin as its universal language
    When writing skill instructions
    Then use Feature for the skill title and overview
    And use Scenario for each distinct procedure
    And use Given/When/Then for step-by-step instructions
    And use Data Tables for structured data and options
    And do NOT use Markdown — Gherkin is the format

  Scenario: Progressive disclosure in RoleX
    Given context is a shared resource
    When designing a skill
    Then layer 1 is the procedure — metadata always loaded at activate time
    And layer 2 is the skill — full SKILL.md loaded on demand via skill(locator)
    And layer 3 is references — loaded only when the skill needs them
    And keep SKILL.md concise — only include what the role needs to act

  Scenario: Conciseness principle
    Given the role is already capable
    When writing skill content
    Then only add knowledge the role does not already have
    And prefer concrete examples over verbose explanations
    And challenge each scenario — does this justify its token cost
    And split large skills into SKILL.md + references/

  Scenario: Creating a new skill
    Given the role needs a new capability
    When creating a skill
    Then create the skill directory under prototypes/skills/
    And write resource.json with name, type, tag, author, description
    And write SKILL.md with Feature title + Scenarios
    And add references/ for detailed content loaded on demand
    And add scripts/ for deterministic executable tasks
    And test the skill by loading it via skill(locator)

  Scenario: Registering a skill as a procedure
    Given a skill is created and tested
    When the role masters the skill
    Then a procedure is created in the role's knowledge
    And the procedure contains the ResourceX locator
    And the role can load the full skill via skill(locator) when needed
