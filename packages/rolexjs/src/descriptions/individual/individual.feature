Feature: Individual System
  The role's first-person cognitive lifecycle.
  Everything here is done BY the role itself.

  Scenario: Cognition frame
    Given identity loads who I am
    Then I have persona, knowledge, procedure, and experience

  Scenario: Intention frame
    Given focus loads what I am doing
    Then I have goal, plan, and tasks

  Scenario: Doing cycle
    Given I pursue goals through structured execution
    Then want → design → todo → finish → achieve or abandon

  Scenario: Learning cycle
    Given encounters become growth
    Then synthesize → reflect → knowledge becomes part of identity

  Scenario: Capability
    Given I have skills and tools
    Then skill loads instructions, use executes tools
