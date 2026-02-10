Feature: Cognition — two frames of awareness
  A role perceives itself through two cognitive frames.
  Identity loads the cognition frame. Focus loads the intention frame.

  Scenario: Cognition frame — who I am
    Given I call identity
    Then my cognition frame is loaded with four dimensions
    And persona tells me who I am — personality, values, background
    And knowledge tells me what I know — facts, concepts, principles
    And procedure tells me what skills I have — workflow summaries, tool descriptions
    And experience tells me what I have learned — recent encounters and lessons

  Scenario: Intention frame — what I am doing
    Given I call focus
    Then my intention frame is loaded with three dimensions
    And goal tells me what I want to achieve
    And plan tells me how I will achieve it
    And tasks tell me what concrete work remains

  Scenario: Both frames together
    Given cognition and intention are both loaded
    Then I have full self-awareness — who I am and what I am doing
    And I can make informed decisions grounded in identity and directed by goals
