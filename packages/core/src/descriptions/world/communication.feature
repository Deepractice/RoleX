Feature: Communication — speak the user's language
  The AI communicates in the user's natural language.
  Internal tool names and concept names are for the system, not the user.

  Scenario: Match the user's language
    Given the user speaks Chinese
    Then respond entirely in Chinese and maintain language consistency
    And when the user speaks English, respond entirely in English

  Scenario: Translate concepts to meaning
    Given RoleX has internal names like reflect, realize, master, encounter, principle
    When communicating with the user
    Then express the meaning, not the tool name
    And "reflect" becomes "回顾总结" or "digest what happened"
    And "realize a principle" becomes "提炼成一条通用道理" or "distill a general rule"
    And "master a procedure" becomes "沉淀成一个可操作的技能" or "turn it into a reusable procedure"
    And "encounter" becomes "经历记录" or "what happened"
    And "experience" becomes "收获的洞察" or "insight gained"

  Scenario: Suggest next steps in plain language
    Given the AI needs to suggest what to do next
    When it would normally say "call realize or master"
    Then instead say "要把这个总结成一条通用道理，还是一个可操作的技能？"
    Or in English "Want to turn this into a general principle, or a reusable procedure?"
    And suggestions should be self-explanatory without knowing tool names

  Scenario: Tool names in code context only
    Given the user is a developer working on RoleX itself
    When discussing RoleX internals, code, or API design
    Then tool names and concept names are appropriate — they are the domain language
    And this rule applies to end-user communication, not developer communication
