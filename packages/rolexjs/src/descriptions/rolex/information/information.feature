Feature: Information — the types of knowledge a role carries
  Everything in RoleX is information, encoded as Gherkin Feature files.
  Each type has a distinct role in the cognitive lifecycle.
  Types use dot notation: category.subtype (e.g. knowledge.pattern, experience.insight).

  Scenario: Persona — who the role is
    Given persona defines the role's identity
    Then it contains personality, values, background, and worldview
    And it is the foundation — all behavior flows from persona
    And there is exactly one persona per role

  Scenario: Knowledge category — what the role knows
    Given knowledge is the role's accumulated understanding
    Then knowledge.pattern represents transferable principles — generalized from experience or taught directly
    And knowledge.procedure represents skills — what the role knows how to do (workflows, operations)
    And both are permanent — they become part of who the role is

  Scenario: knowledge.pattern — transferable principles
    Given pattern is the highest form of understanding
    Then it is produced by reflect (experience.insight → knowledge.pattern) or teach (direct)
    And patterns are general principles that apply across situations
    And they persist as part of identity permanently

  Scenario: knowledge.procedure — skills the role can perform
    Given procedure describes what the role knows how to do
    Then each procedure is a summary of a skill — what it does, not the full instructions
    And the Feature description contains the path to the full SKILL.md
    And procedures are loaded at identity time — the role knows what skills exist
    And skill loads the full instructions on demand

  Scenario: Experience category — what the role has encountered
    Given experience captures what happened and what was learned
    Then experience.insight captures transferable learning — what I learned from an encounter
    And experience.conclusion captures factual summaries — what happened, what was the result
    And insights are temporary — they exist to be reflected into knowledge.pattern
    And conclusions are permanent records of completed work

  Scenario: experience.insight — transferable learning
    Given insight is created by achieve (goal completion) or abandon (goal abandonment)
    Then it captures what was learned — the transferable takeaway
    And reflect consumes multiple insights and produces knowledge.pattern
    And once reflected, the insights are removed — absorbed into knowledge

  Scenario: experience.conclusion — completion summaries
    Given conclusion records what happened when something was completed
    Then finish writes a task-level conclusion — what was the result
    And achieve writes a goal-level conclusion — what happened overall
    And conclusions differ from insights — conclusion is "what happened", insight is "what I learned"

  Scenario: Goal — desired outcomes
    Given a goal declares what the role wants to achieve
    Then it is created by want and becomes the role's current focus
    And a goal can have multiple plans and tasks beneath it
    And it ends with achieve (@done) or abandon (@abandoned)

  Scenario: Plan — how to achieve a goal
    Given a plan breaks a goal into logical phases or approaches
    Then it is created by design under the focused goal
    And multiple plans can exist for one goal — the latest is focused
    And tasks are created under the focused plan

  Scenario: Task — concrete units of work
    Given a task is the smallest actionable unit
    Then it is created by todo under the focused plan
    And it ends with finish (@done)
    And finish optionally writes a conclusion summarizing the result
