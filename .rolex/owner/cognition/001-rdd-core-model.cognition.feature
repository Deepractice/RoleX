@rolex @owner @cognition
Feature: RDD Core Model
  As the Rolex owner, I define the five-dimension model that every role
  operates through, so all platform implementations align on the same structure.

  # ============================================================================
  # The Five Dimensions
  # ============================================================================
  #
  #  Cognition (认知)        ← Always present. The role's premise. Container.
  #    └→ Goal (目标)        ← What to achieve in this phase. IS-A Feature.
  #        └→ Plan (计划)    ← How to achieve the goal. IS-A Feature.
  #            └→ Task (任务)  ← Concrete unit of work. IS-A Feature.
  #                └→ Skill (技能) ← Capability to execute the task.
  #

  Scenario: Owner defines the five dimensions of a role
    Given a role is the primary organizing unit in RDD
    Then every role operates through five dimensions:
      | dimension | answers            | nature                  |
      | Cognition | What does it know? | Static — always present |
      | Goal      | What does it want? | Dynamic — per phase     |
      | Plan      | How to achieve it? | Derived — from goal     |
      | Task      | What to do?        | Concrete — unit of work |
      | Skill     | What capabilities? | Selected — for tasks    |
    And verification is embedded — Scenario.verifiable determines testability

  # ============================================================================
  # Type System
  # ============================================================================
  #
  #  Feature (extends GherkinFeature)
  #  ├── type: 'cognition' | 'goal' | 'plan' | 'task'
  #  ├── scenarios: Scenario[]
  #  │   └── verifiable: boolean  (determined by @testable tag)
  #  │
  #  ├── Goal (extends Feature, type: 'goal')   ← IS-A Feature
  #  ├── Plan (extends Feature, type: 'plan')   ← IS-A Feature
  #  └── Task (extends Feature, type: 'task')   ← IS-A Feature
  #
  #  Scenario (extends GherkinScenario)
  #  └── verifiable: boolean
  #
  #  Cognition { features: Feature[] }           ← HAS-A Features (container)
  #  Role { name, cognition, goals }
  #  Skill { name, reference }
  #  Platform (interface)                         ← Storage abstraction
  #

  Scenario: Owner defines the type hierarchy
    Given all dimensions are expressed as Gherkin Features
    Then the type system is:
      | type      | extends  | relationship | purpose                    |
      | Feature   | Gherkin  | base type    | Adds type + scenarios      |
      | Scenario  | Gherkin  | base type    | Adds verifiable flag       |
      | Goal      | Feature  | IS-A         | type='goal'                |
      | Plan      | Feature  | IS-A         | type='plan'                |
      | Task      | Feature  | IS-A         | type='task'                |
      | Cognition | —        | HAS-A        | Wraps Feature[] container  |
      | Role      | —        | top-level    | name + cognition + goals   |
      | Skill     | —        | reference    | name + reference pointer   |
      | Platform  | —        | interface    | Storage abstraction layer  |

  Scenario: Owner defines Role as the top-level container
    Given the type hierarchy
    Then a Role contains:
      | field     | type       | purpose                     |
      | name      | string     | Role identifier             |
      | cognition | Cognition  | Static knowledge (HAS-A)    |
      | goals     | Goal[]     | Dynamic objectives (IS-A)   |

  Scenario: Owner defines Cognition as a Feature container
    Given cognition is the role's static premise
    Then Cognition wraps multiple Features:
      | field    | type      | purpose                         |
      | features | Feature[] | All cognition Feature content   |
    And cognition is NOT a Feature itself — it is a container
    And it is always loaded, independent of any goal

  Scenario: Owner defines Goal, Plan, Task as Features
    Given Goal, Plan, Task all IS-A Feature
    Then they inherit all Gherkin Feature properties
    And they are distinguished by their type field:
      | type | purpose              |
      | goal | Dynamic objective    |
      | plan | Execution design     |
      | task | Concrete work item   |
    And relationships are managed by the Rolex API — not nested in types

  Scenario: Owner defines verification as embedded in Scenario
    Given verification does not need a separate type
    Then Scenario.verifiable (boolean) determines testability:
      | tag        | verifiable | meaning                        |
      | @testable  | true       | Becomes persistent test case   |
      | (none)     | false      | One-time acceptance criterion  |
    And verifiable scenarios are extracted from goal/task Features

  # ============================================================================
  # Architecture
  # ============================================================================

  Scenario: Owner defines the Platform abstraction
    Given roles can be stored in different backends
    Then Platform is an interface that abstracts storage:
      | implementation  | backend                  |
      | LocalPlatform   | Local filesystem (.rolex/) |
      | (future)        | Database, cloud, API     |
    And Rolex class delegates to Platform
    And core defines WHAT, Platform defines HOW and WHERE

  Scenario: Owner defines the package architecture
    Given Rolex follows the own-the-interface principle
    Then the architecture is:
      | package          | responsibility                     |
      | @rolexjs/core    | Pure types + Platform interface    |
      | @rolexjs/parser  | Gherkin parsing (wraps cucumber)   |
      | rolexjs          | Rolex class + LocalPlatform        |

  Scenario: Owner defines the Rolex class API
    Given the API is flow-oriented for AI agents
    Then Rolex provides these methods:
      | method             | returns          | purpose                       |
      | cognition()        | Feature[]        | Load all cognition            |
      | activeGoal()       | Goal + context   | Current goal with plan + tasks|
      | createGoal(n, src) | Goal             | Create new goal               |
      | createPlan(src)    | Plan             | Create plan for active goal   |
      | createTask(n, src) | Task             | Add task to active goal       |
      | completeGoal()     | void             | Mark goal @done               |
      | completeTask(n)    | void             | Mark task @done               |
    And all inputs are Gherkin text (string)
    And all outputs are Feature-based types
    And Rolex delegates every method to Platform
