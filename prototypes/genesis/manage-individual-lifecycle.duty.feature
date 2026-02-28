Feature: Manage individual lifecycle
  Oversee the full lifecycle of individuals in the RoleX world.

  Scenario: Birth and identity
    Given a new individual needs to exist
    When born is called with identity content
    Then the individual is created under society with an identity node

  Scenario: Knowledge injection
    Given an individual needs foundational knowledge or skills
    When teach or train is called
    Then principles or procedures are injected into the individual

  Scenario: Archival
    Given an individual is no longer active
    When retire or die is called
    Then the individual is archived to past
