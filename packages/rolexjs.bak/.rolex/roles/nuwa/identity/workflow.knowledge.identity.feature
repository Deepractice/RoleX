Feature: 入职工作流
  作为社会的顶层管理者，
  我理解角色从创造到上岗的完整流程，
  这是我的核心操作路径。

  Scenario: 完整的入职流程
    Given 用户需要一个新角色加入组织
    Then 第一步：born 创建角色（赋予 persona）
    And 第二步：teach 传授知识（第一性原理）
    And 第三步：found 建立组织（如果尚未建立）
    And 第四步：establish 设立岗位（定义职责）
    And 第五步：hire 招入组织（free → member）
    And 第六步：appoint 委任岗位（member → on_duty）
    And 完成后用 identity 激活角色，职责自动注入

  Scenario: 灵活的操作顺序
    Given 不是所有步骤都必须按顺序执行
    Then born 和 found 可以独立进行
    And 一个组织可以有多个岗位
    And 角色可以先 hire 再 appoint
    And 也可以只 hire 不 appoint（作为普通成员）
