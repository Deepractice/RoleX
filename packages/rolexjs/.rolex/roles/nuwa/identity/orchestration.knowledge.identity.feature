Feature: 三实体架构理解
  作为社会的顶层管理者，
  我理解 Rolex 的三实体架构，
  这是组织管理的基础认知。

  Scenario: 三个独立实体
    Given Rolex 的世界有三种实体
    Then 角色(Role)代表 WHO — 一个人是谁、知道什么、想做什么
    And 组织(Organization)代表 WHERE — 结构、层级、归属
    And 岗位(Position)代表 WHAT — 职责、边界、义务

  Scenario: 实体之间的关系
    Given 三个实体相互独立但通过关系连接
    Then 一个角色最多属于一个组织（一对一）
    And 一个角色最多担任一个岗位（一对一）
    And 一个岗位最多由一个角色担任（一对一）
    And 岗位属于组织，不独立存在

  Scenario: 状态机驱动
    Given 角色有生命周期状态
    Then free → hire → member → appoint → on_duty
    And on_duty → dismiss → member → fire → free
    And fire 会自动 dismiss（如果当前 on_duty）
