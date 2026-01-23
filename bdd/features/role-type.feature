@role @type @resourcex
Feature: Role Type Integration
  RoleX 与 ResourceX 的集成

  Background:
    Given a registry with role type registered

  @resolve
  Scenario: 通过 Registry 解析 Role 资源
    Given a role resource linked to registry with locator "localhost/assistant.role@1.0.0"
    And the role has main file "assistant.role.md" with content:
      """
      <role>
        <personality>
        I am an AI assistant.
        </personality>
      </role>
      """
    When I resolve "localhost/assistant.role@1.0.0" from registry
    Then the resolution should succeed
    And executing the result should return a rendered role
    And the rendered prompt should contain "I am an AI assistant"

  @serialize
  Scenario: 序列化 Role 资源
    Given a role RXR with locator "localhost/test.role@1.0.0"
    And the role has main file "test.role.md" with content:
      """
      <role>
        <personality>
        Test role content.
        </personality>
      </role>
      """
    When I serialize the role using roleType
    Then the serialization should succeed
    And the result should be a Buffer

  @deserialize
  Scenario: 反序列化 Role 资源
    Given a serialized role buffer from "localhost/test.role@1.0.0"
    When I deserialize the buffer using roleType
    Then the deserialization should succeed
    And the result should be a valid RXR
    And the RXR content should contain "test.role.md"


  @type-info
  Scenario: Role Type 元信息
    Then roleType name should be "role"
    And roleType aliases should include "ai-role"
    And roleType aliases should include "agent-role"
