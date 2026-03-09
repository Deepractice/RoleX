import type { Migration } from "@rolexjs/core";

export const V2__add_issue_management: Migration = {
  version: 2,
  id: "V2__add_issue_management",
  checksum: "",
  instructions: [
    {
      op: "!society.train",
      args: {
        individual: "nuwa",
        id: "issue-management",
        content: `Feature: Issue Management
  issue-management

  Scenario: When to use this skill
    Given I need to manage issues (create, update, close, list)
    And I need to track bugs, tasks, or feature requests
    When the operation involves issue lifecycle
    Then load this skill for detailed instructions`,
      },
    },
  ],
};
