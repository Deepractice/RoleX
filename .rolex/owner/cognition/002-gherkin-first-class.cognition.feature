@rolex @owner @cognition
Feature: Gherkin as First-Class Citizen
  As the Rolex owner, I define that BDD Gherkin is the first-class language
  in the Rolex world, so all role dimensions are expressed and loaded
  through .feature files.

  # ============================================================================
  # Why Gherkin
  # ============================================================================

  Scenario: Owner understands why Gherkin is the right language for roles
    Given a role needs a structured language to express all five dimensions
    Then Gherkin is chosen because it already covers the full spectrum:
      | Gherkin element | maps to          | expresses         |
      | Feature         | Goal             | WHAT to achieve   |
      | Scenario        | Plan / Task      | HOW to achieve it |
      | Given           | Cognition        | WHY — the context |
      | When            | Task + Skill     | HOW — the action  |
      | Then            | Verification     | WHAT — the proof  |
    And no new language needs to be invented
    And no new parser needs to be built

  Scenario: Owner understands the practical advantages
    Given Gherkin has been battle-tested for decades
    Then it brings concrete advantages:
      | advantage           | what it means for Rolex                        |
      | Industry standard   | Every language has a Gherkin parser             |
      | Human readable      | Non-technical people can read and write roles   |
      | AI readable         | LLMs understand Gherkin natively               |
      | Structured          | Feature/Scenario/Step is a natural hierarchy    |
      | Tables              | First-class table syntax for structured knowledge |
      | Tags                | @cognition @goal @owner for filtering          |
      | Multilingual        | Supports Chinese Gherkin (功能/场景/假设/当/那么) |

  # ============================================================================
  # Gherkin Covers All Five Dimensions
  # ============================================================================

  Scenario: Owner maps each dimension to Gherkin
    Given the five-dimension model from 001
    Then each dimension has a natural Gherkin expression:
      | dimension    | Gherkin expression                              |
      | Cognition    | Feature + Scenario describing what the role knows |
      | Goal         | Feature describing what to achieve               |
      | Plan         | Scenario outline with steps                      |
      | Task + Skill | When steps referencing capabilities               |
      | Verification | Then steps asserting goal achievement             |
    And all five dimensions live in .feature files
    And .feature is the only file format Rolex needs to understand

  # ============================================================================
  # One Format, One Parser, One Toolchain
  # ============================================================================

  Scenario: Owner defines the single-format principle
    Given Gherkin is the first-class citizen
    Then Rolex follows the single-format principle:
      | principle                          | consequence                          |
      | One format for all dimensions      | .feature files only                  |
      | One parser for all loading         | Gherkin parser handles everything    |
      | One toolchain for all validation   | Cucumber runs all verifiable scenarios |
      | One syntax for human and AI        | No format translation needed         |
    And this simplifies the local-platform — read .feature, parse Gherkin, build Role
    And this simplifies onboarding — learn Gherkin once, use it everywhere

  Scenario: Owner understands what Gherkin is NOT in Rolex
    Given Gherkin is primarily a BDD testing format
    But in Rolex, Gherkin serves a broader purpose:
      | traditional BDD use          | Rolex use                              |
      | Describe testable behaviors  | Describe role knowledge and beliefs    |
      | Drive automated tests        | Drive role loading and AI context      |
      | Acceptance criteria          | Role definition and verification       |
    And not every Scenario in Rolex has step definitions
    And cognition Scenarios are loaded as context — not executed as tests
    And goal Scenarios may have step definitions — for automated verification
    And this distinction is by design, not a limitation
