@role @loading
Feature: Role Loading
  加载和解析 DPML Role 资源

  Background:
    Given a registry is created

  @basic
  Scenario: 加载简单的 Role 资源
    Given a role resource with locator "localhost/simple.role@1.0.0"
    And the role has main file "simple.role.md" with content:
      """
      <role>
        <personality>
        I am a simple assistant.
        </personality>
      </role>
      """
    When I load the role
    Then the role should be loaded successfully
    And the rendered prompt should contain "I am a simple assistant"

  @resource
  Scenario: 加载带有内部资源引用的 Role
    Given a role resource with locator "localhost/with-refs.role@1.0.0"
    And the role has main file "with-refs.role.md" with content:
      """
      <role>
        <personality>
        I am an assistant.
        <resource src="arp:text:rxr://localhost/with-refs.role@1.0.0/thought/first-principles.thought.md"/>
        </personality>
      </role>
      """
    And the role has file "thought/first-principles.thought.md" with content:
      """
      <thought>
        <exploration>
        ## First Principles Thinking
        Always question assumptions.
        </exploration>
      </thought>
      """
    When I load the role
    Then the role should be loaded successfully
    And the rendered prompt should contain "I am an assistant"
    And the rendered prompt should contain "First Principles Thinking"
    And the rendered prompt should contain "Always question assumptions"

  @three-layer
  Scenario: 加载完整三层架构的 Role
    Given a role resource with locator "localhost/full.role@1.0.0"
    And the role has main file "full.role.md" with content:
      """
      <role>
        <personality>
        I am a full-featured assistant.
        <resource src="arp:text:rxr://localhost/full.role@1.0.0/thought/critical-thinking.thought.md"/>
        </personality>
        <principle>
        <resource src="arp:text:rxr://localhost/full.role@1.0.0/execution/main-workflow.execution.md"/>
        </principle>
        <knowledge>
        <resource src="arp:text:rxr://localhost/full.role@1.0.0/knowledge/domain-knowledge.knowledge.md"/>
        </knowledge>
      </role>
      """
    And the role has file "thought/critical-thinking.thought.md" with content:
      """
      <thought>
        <reasoning>
        Apply logical reasoning to all problems.
        </reasoning>
      </thought>
      """
    And the role has file "execution/main-workflow.execution.md" with content:
      """
      <execution>
        <process>
        ## Main Workflow
        1. Understand the question
        2. Think step by step
        3. Provide the answer
        </process>
      </execution>
      """
    And the role has file "knowledge/domain-knowledge.knowledge.md" with content:
      """
      <knowledge>
      ## Domain Knowledge
      This is proprietary knowledge for this role.
      </knowledge>
      """
    When I load the role
    Then the role should be loaded successfully
    And the personality should contain "Apply logical reasoning"
    And the principle should contain "Main Workflow"
    And the knowledge should contain "Domain Knowledge"

  @error
  Scenario: 加载没有 .role.md 文件的资源应该报错
    Given a role resource with locator "localhost/invalid.role@1.0.0"
    And the role has file "readme.md" with content:
      """
      This is not a role file.
      """
    When I try to load the role
    Then it should fail with error "No .role.pml or .role.md file found"

  @error
  Scenario: 引用不存在的资源应该报错
    Given a role resource with locator "localhost/broken.role@1.0.0"
    And the role has main file "broken.role.md" with content:
      """
      <role>
        <personality>
        <resource src="arp:text:rxr://localhost/broken.role@1.0.0/thought/nonexistent.thought.md"/>
        </personality>
      </role>
      """
    When I try to load the role
    Then it should fail with error containing "not found"
