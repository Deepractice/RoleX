@resource @resolution
Feature: Resource Resolution
  通过 ARP 协议解析 Role 中的资源引用

  Background:
    Given a registry is created

  @arp @rxr
  Scenario: 通过 arp:text:rxr:// 解析归档内文件
    Given a role resource with locator "localhost/test.role@1.0.0"
    And the role has file "thought/my-thought.thought.md" with content:
      """
      <thought>
        <exploration>
        This is my thought content.
        </exploration>
      </thought>
      """
    When I resolve "arp:text:rxr://localhost/test.role@1.0.0/thought/my-thought.thought.md"
    Then the content should be:
      """
      <thought>
        <exploration>
        This is my thought content.
        </exploration>
      </thought>
      """


  @error
  Scenario: 解析不存在的 RXR 路径应该报错
    Given a role resource with locator "localhost/test.role@1.0.0"
    When I try to resolve "arp:text:rxr://localhost/test.role@1.0.0/nonexistent.md"
    Then it should fail with error containing "not found"

  @error
  Scenario: 非 ARP 格式应该报错
    When I try to resolve "thought/my-thought.md"
    Then it should fail with error "Resource must use ARP format"
