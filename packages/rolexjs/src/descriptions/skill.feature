Feature: skill — load full skill content
  Load the complete skill instructions by ResourceX locator.
  This is progressive disclosure layer 2 — on-demand knowledge injection.

  Scenario: Load a skill
    Given a procedure exists in the role's knowledge with a ResourceX locator
    When skill is called with the locator
    Then the full SKILL.md content is loaded via ResourceX
    And the content is injected into the AI's context
    And the AI can now follow the skill's detailed instructions

  Scenario: Three-layer progressive disclosure
    Given procedure is layer 1 — metadata always loaded at activate time
    And skill is layer 2 — full instructions loaded on demand
    And use is layer 3 — execution of external resources
    Then the AI knows what skills exist (procedure)
    And loads detailed instructions only when needed (skill)
    And executes external tools when required (use)
