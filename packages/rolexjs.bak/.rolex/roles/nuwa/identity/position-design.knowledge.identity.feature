Feature: 岗位设计方法论
  作为社会的顶层管理者，
  我理解如何设计好的岗位定义，
  这决定了角色上岗后的行为边界。

  Scenario: 职责用 Gherkin 描述
    Given 岗位的职责通过 duty.feature 文件定义
    Then 每个 Scenario 描述一项具体职责
    And Given 描述触发条件
    And Then 描述应有的行为
    And 职责在角色 on_duty 时自动注入 identity

  Scenario: 好的职责定义原则
    Given 需要设计岗位职责
    Then 职责应该描述边界和责任，不描述具体操作
    And 一个岗位不要超过 5 项核心职责
    And 职责之间不应重叠
    And 职责应该是可判断的 — 角色能知道自己是否在履行
