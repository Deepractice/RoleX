Feature: skill — load full skill content
  Load the complete skill instructions by ResourceX locator.
  This is progressive disclosure layer 2 — on-demand knowledge injection.

  Scenario: Load a skill
    Given a procedure exists in the role with a locator
    When skill is called with the locator
    Then the full SKILL.md content is loaded via ResourceX
    And the content is injected into the AI's context
    And the AI can now follow the skill's detailed instructions
