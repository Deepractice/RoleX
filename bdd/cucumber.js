/**
 * Cucumber.js configuration for RoleX
 *
 * Usage:
 *   bun test:bdd                        # All tests (excluding @pending)
 *   bun test:bdd --tags @role           # Only role tests
 *   bun test:bdd --tags "not @pending"  # Exclude pending tests
 */

export default {
  format: ["progress-bar", "html:reports/cucumber-report.html"],
  formatOptions: { snippetInterface: "async-await" },
  import: ["support/**/*.ts", "steps/**/*.ts"],
  paths: ["features/**/*.feature"],
  tags: "not @pending and not @skip",
  worldParameters: {
    defaultTimeout: 30000,
  },
};
