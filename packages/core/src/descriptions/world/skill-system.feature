Feature: Skill system — progressive disclosure and resource loading
  Skills are loaded on demand through a three-layer progressive disclosure model.
  Each layer adds detail only when needed, keeping the AI's context lean.

  Scenario: Three-layer progressive disclosure
    Given procedure is layer 1 — metadata always loaded at activate time
    And skill is layer 2 — full instructions loaded on demand via skill(locator)
    And use is layer 3 — execution of external resources
    Then the AI knows what skills exist (procedure)
    And loads detailed instructions only when needed (skill)
    And executes external tools when required (use)

  Scenario: ResourceX Locator — unified resource address
    Given a locator is how procedures reference their full skill content
    Then a locator can be an identifier — name or registry/path/name
    And a locator can be a source path — a local directory or URL
    And examples of identifier form: deepractice/skill-creator, my-prompt:1.0.0
    And examples of source form: ./skills/my-skill, https://github.com/org/repo
    And the tag defaults to latest when omitted — deepractice/skill-creator means deepractice/skill-creator:latest
    And the system auto-detects which form is used and resolves accordingly

  Scenario: Writing a procedure — the skill reference
    Given a procedure is layer 1 metadata pointing to full skill content
    Then the Feature title names the capability
    And the description includes the locator for full skill loading
    And Scenarios describe when and why to apply this skill
    And the tone is referential — pointing to the full skill, not containing it
