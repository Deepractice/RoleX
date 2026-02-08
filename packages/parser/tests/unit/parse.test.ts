import { describe, expect, test } from "bun:test";
import { parse } from "../../src/index.js";

describe("parse", () => {
  test("parses a basic feature", () => {
    const doc = parse(`
Feature: My Feature
  As a user I want something

  Scenario: First scenario
    Given a precondition
    When an action
    Then an outcome
`);

    expect(doc.feature).toBeDefined();
    expect(doc.feature!.name).toBe("My Feature");
    expect(doc.feature!.children).toHaveLength(1);

    const scenario = doc.feature!.children[0].scenario!;
    expect(scenario.name).toBe("First scenario");
    expect(scenario.steps).toHaveLength(3);
    expect(scenario.steps[0].keyword.trim()).toBe("Given");
    expect(scenario.steps[0].text).toBe("a precondition");
    expect(scenario.steps[1].keyword.trim()).toBe("When");
    expect(scenario.steps[2].keyword.trim()).toBe("Then");
  });

  test("parses tags", () => {
    const doc = parse(`
@rolex @owner
Feature: Tagged Feature

  @cognition
  Scenario: Tagged scenario
    Given something
`);

    expect(doc.feature!.tags).toHaveLength(2);
    expect(doc.feature!.tags[0].name).toBe("@rolex");
    expect(doc.feature!.tags[1].name).toBe("@owner");

    const scenario = doc.feature!.children[0].scenario!;
    expect(scenario.tags).toHaveLength(1);
    expect(scenario.tags[0].name).toBe("@cognition");
  });

  test("parses data tables", () => {
    const doc = parse(`
Feature: Table Feature

  Scenario: With table
    Given the following data:
      | name    | role       |
      | Alice   | maintainer |
      | Bob     | contributor|
`);

    const step = doc.feature!.children[0].scenario!.steps[0];
    expect(step.dataTable).toBeDefined();
    expect(step.dataTable!.rows).toHaveLength(3);
    expect(step.dataTable!.rows[0].cells[0].value).toBe("name");
    expect(step.dataTable!.rows[1].cells[0].value).toBe("Alice");
  });

  test("parses doc strings", () => {
    const doc = parse(`
Feature: DocString Feature

  Scenario: With doc string
    Given the following text:
      """
      This is a multi-line
      doc string content
      """
`);

    const step = doc.feature!.children[0].scenario!.steps[0];
    expect(step.docString).toBeDefined();
    expect(step.docString!.content).toContain("multi-line");
  });

  test("parses comments", () => {
    const doc = parse(`
# This is a comment
Feature: Commented Feature

  # Another comment
  Scenario: A scenario
    Given something
`);

    expect(doc.comments.length).toBeGreaterThan(0);
    expect(doc.comments[0].text.trim()).toBe("# This is a comment");
  });

  test("parses Chinese Gherkin", () => {
    const doc = parse(`
# language: zh-CN
功能: 角色管理

  场景: 加载角色
    假设 系统中存在角色定义
    当 加载角色
    那么 应该返回角色实例
`);

    expect(doc.feature!.name).toBe("角色管理");
    const scenario = doc.feature!.children[0].scenario!;
    expect(scenario.name).toBe("加载角色");
    expect(scenario.steps).toHaveLength(3);
  });
});
