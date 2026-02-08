import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { Rolex } from "../../src/Rolex.js";
import { Organization } from "../../src/Organization.js";
import { Role } from "../../src/Role.js";
import { LocalPlatform } from "../../src/LocalPlatform.js";

const TEST_ROOT = join(import.meta.dir, "../.test-rolex");
const ROLEX_DIR = join(TEST_ROOT, ".rolex");
const ROLE_NAME = "owner";

function setupTestOrg() {
  const roleDir = join(ROLEX_DIR, "owner");
  mkdirSync(join(roleDir, "identity"), { recursive: true });
  mkdirSync(join(roleDir, "goals"), { recursive: true });

  // rolex.json — organization config
  writeFileSync(
    join(ROLEX_DIR, "rolex.json"),
    JSON.stringify({
      name: "Test Org",
      teams: { default: ["owner"] },
    }),
  );

  writeFileSync(
    join(roleDir, "identity", "001-basics.identity.feature"),
    `@rolex @owner @identity
Feature: Basic Knowledge
  Scenario: Owner knows the basics
    Given the role model exists
    Then everything is a Feature
`,
  );

  writeFileSync(
    join(roleDir, "identity", "002-principles.identity.feature"),
    `@rolex @owner @identity
Feature: Core Principles
  Scenario: Gherkin is first-class
    Given Gherkin covers all dimensions
    Then no new format needed
`,
  );
}

function setupGoal() {
  const goalDir = join(ROLEX_DIR, "owner", "goals", "test-goal");
  mkdirSync(goalDir, { recursive: true });

  writeFileSync(
    join(goalDir, "test-goal.goal.feature"),
    `@rolex @owner @goal
Feature: Test Goal
  Scenario: Deliver something
    Given a requirement
    When I implement it
    Then it works
`,
  );
}

function setupDoneGoal() {
  const goalDir = join(ROLEX_DIR, "owner", "goals", "done-goal");
  mkdirSync(goalDir, { recursive: true });

  writeFileSync(
    join(goalDir, "done-goal.goal.feature"),
    `@rolex @owner @goal @done
Feature: Completed Goal
  Scenario: Already done
    Given it was done
    Then it is marked done
`,
  );
}

describe("Rolex (society)", () => {
  beforeEach(() => {
    rmSync(TEST_ROOT, { recursive: true, force: true });
    setupTestOrg();
  });

  afterEach(() => {
    rmSync(TEST_ROOT, { recursive: true, force: true });
  });

  // ========== born() ==========

  test("born() creates a role with persona", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    const persona = rolex.born(
      "alex",
      `Feature: Alex
  Scenario: How I think
    Given a problem to solve
    Then I break it into small pieces
`,
    );

    expect(persona.type).toBe("persona");
    expect(persona.name).toBe("Alex");

    expect(existsSync(join(ROLEX_DIR, "alex", "identity", "persona.identity.feature"))).toBe(true);
    expect(existsSync(join(ROLEX_DIR, "alex", "goals"))).toBe(false);
  });

  // ========== found() ==========

  test("found() creates organization config", () => {
    rmSync(TEST_ROOT, { recursive: true, force: true });
    mkdirSync(ROLEX_DIR, { recursive: true });

    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    rolex.found("Deepractice");

    expect(existsSync(join(ROLEX_DIR, "rolex.json"))).toBe(true);

    const dir = rolex.directory();
    expect(dir.organizations[0].name).toBe("Deepractice");
  });

  // ========== directory() ==========

  test("directory() returns all roles and organizations", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    const dir = rolex.directory();

    expect(dir.organizations).toHaveLength(1);
    expect(dir.organizations[0].name).toBe("Test Org");
    expect(dir.roles.length).toBeGreaterThan(0);
    expect(dir.roles.find((r) => r.name === "owner")).toBeDefined();
  });

  // ========== find() ==========

  test("find() returns Organization for org name", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    const result = rolex.find("Test Org");

    expect(result).toBeInstanceOf(Organization);
  });

  test("find() returns Role for role name", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    const result = rolex.find("owner");

    expect(result).toBeInstanceOf(Role);
  });

  test("find() throws for unknown name", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    expect(() => rolex.find("nobody")).toThrow("Not found in society");
  });
});

describe("Organization", () => {
  beforeEach(() => {
    rmSync(TEST_ROOT, { recursive: true, force: true });
    setupTestOrg();
  });

  afterEach(() => {
    rmSync(TEST_ROOT, { recursive: true, force: true });
  });

  // ========== info() ==========

  test("info() returns org structure", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    const org = rolex.find("Test Org") as Organization;
    const info = org.info();

    expect(info.name).toBe("Test Org");
    expect(info.roles.length).toBeGreaterThan(0);
  });

  // ========== hire() ==========

  test("hire() establishes org link for a born role", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    const org = rolex.find("Test Org") as Organization;
    rolex.born(
      "alex",
      `Feature: Alex
  Scenario: My nature
    Given I am direct
    Then I get to the point
`,
    );

    org.hire("alex");

    expect(existsSync(join(ROLEX_DIR, "alex", "goals"))).toBe(true);

    const role = rolex.find("alex") as Role;
    const features = role.identity();
    expect(features).toHaveLength(1);
    expect(features[0].type).toBe("persona");
  });

  test("hire() throws if role not born", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    const org = rolex.find("Test Org") as Organization;
    expect(() => org.hire("nobody")).toThrow("Role not found");
  });

  // ========== fire() ==========

  test("fire() removes org link", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    const org = rolex.find("Test Org") as Organization;
    rolex.born(
      "temp",
      `Feature: Temp
  Scenario: Temporary
    Given I exist briefly
    Then I'm gone
`,
    );
    org.hire("temp");
    expect(existsSync(join(ROLEX_DIR, "temp", "goals"))).toBe(true);

    org.fire("temp");
    expect(existsSync(join(ROLEX_DIR, "temp", "goals"))).toBe(false);
    expect(existsSync(join(ROLEX_DIR, "temp", "identity", "persona.identity.feature"))).toBe(true);
  });

  // ========== teach() ==========

  test("teach() adds knowledge to a role", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    const org = rolex.find("Test Org") as Organization;

    const feature = org.teach(
      ROLE_NAME,
      "knowledge",
      "company-policy",
      `Feature: Company Policy
  Scenario: We ship weekly
    Given a development cycle
    Then we release every Friday
`,
    );

    expect(feature.type).toBe("knowledge");
    expect(feature.name).toBe("Company Policy");
  });
});

describe("Role (embodied perspective)", () => {
  beforeEach(() => {
    rmSync(TEST_ROOT, { recursive: true, force: true });
    setupTestOrg();
  });

  afterEach(() => {
    rmSync(TEST_ROOT, { recursive: true, force: true });
  });

  function getRole() {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    return rolex.find("owner") as Role;
  }

  // ========== identity() ==========

  test("identity() loads all identity features", () => {
    const role = getRole();
    const features = role.identity();

    expect(features).toHaveLength(2);
    expect(features[0].type).toBe("knowledge");
    expect(features[0].name).toBe("Basic Knowledge");
    expect(features[1].name).toBe("Core Principles");
  });

  test("identity() returns scenarios with verifiable flag", () => {
    const role = getRole();
    const features = role.identity();

    expect(features[0].scenarios).toHaveLength(1);
    expect(features[0].scenarios[0].name).toBe("Owner knows the basics");
    expect(features[0].scenarios[0].verifiable).toBe(false);
  });

  // ========== growup() ==========

  test("growup() adds knowledge to identity", () => {
    const role = getRole();

    const feature = role.growup(
      "knowledge",
      "distributed-systems",
      `Feature: Distributed Systems
  Scenario: I understand CAP theorem
    Given a distributed data store
    Then I know the CAP trade-offs
`,
    );

    expect(feature.type).toBe("knowledge");
    expect(feature.name).toBe("Distributed Systems");

    const features = role.identity();
    expect(features.find((f) => f.name === "Distributed Systems")).toBeDefined();
  });

  test("growup() adds experience to identity", () => {
    const role = getRole();

    const feature = role.growup(
      "experience",
      "startup-years",
      `Feature: Startup Years
  Scenario: I built a product from zero
    Given a blank codebase
    When I shipped in 3 months
    Then I learned to prioritize ruthlessly
`,
    );

    expect(feature.type).toBe("experience");
    expect(feature.name).toBe("Startup Years");
  });

  test("growup() adds voice to identity", () => {
    const role = getRole();

    const feature = role.growup(
      "voice",
      "direct-style",
      `Feature: Direct Communication
  Scenario: I keep it concise
    Given something to explain
    Then I use the fewest words possible
`,
    );

    expect(feature.type).toBe("voice");
    expect(feature.name).toBe("Direct Communication");
  });

  // ========== focus() ==========

  test("focus() returns null when no goals", () => {
    const role = getRole();
    expect(role.focus()).toBeNull();
  });

  test("focus() returns first active goal", () => {
    setupGoal();
    const role = getRole();
    const goal = role.focus();

    expect(goal).not.toBeNull();
    expect(goal!.type).toBe("goal");
    expect(goal!.name).toBe("Test Goal");
  });

  test("focus() skips @done goals", () => {
    setupDoneGoal();
    const role = getRole();
    expect(role.focus()).toBeNull();
  });

  test("focus() includes plan and tasks context", () => {
    setupGoal();
    const role = getRole();
    const goal = role.focus();

    expect(goal!.plan).toBeNull();
    expect(goal!.tasks).toEqual([]);
  });

  // ========== want() ==========

  test("want() creates a new goal", () => {
    const role = getRole();
    const goal = role.want(
      "new-feature",
      `Feature: New Feature
  Scenario: Something new
    Given a new requirement
    Then it should be created
`,
    );

    expect(goal.type).toBe("goal");
    expect(goal.name).toBe("New Feature");

    const active = role.focus();
    expect(active!.name).toBe("New Feature");
  });

  // ========== plan() ==========

  test("plan() creates plan for active goal", () => {
    setupGoal();
    const role = getRole();

    const plan = role.plan(
      `Feature: Implementation Plan
  Scenario: Step 1
    When I do the first thing
    Then it progresses
`,
    );

    expect(plan.type).toBe("plan");
    expect(plan.name).toBe("Implementation Plan");

    const goal = role.focus();
    expect(goal!.plan).not.toBeNull();
    expect(goal!.plan!.name).toBe("Implementation Plan");
  });

  test("plan() throws when no active goal", () => {
    const role = getRole();
    expect(() => role.plan("Feature: No Goal\n")).toThrow("No active goal");
  });

  // ========== todo() ==========

  test("todo() creates task for active goal", () => {
    setupGoal();
    const role = getRole();

    const task = role.todo(
      "implement-loader",
      `Feature: Implement Loader
  Scenario: Load files
    When I read the directory
    Then files are loaded
`,
    );

    expect(task.type).toBe("task");
    expect(task.name).toBe("Implement Loader");

    const goal = role.focus();
    expect(goal!.tasks).toHaveLength(1);
  });

  // ========== achieve() ==========

  test("achieve() marks active goal as done", () => {
    setupGoal();
    const role = getRole();

    expect(role.focus()).not.toBeNull();
    role.achieve();
    expect(role.focus()).toBeNull();
  });

  test("achieve() with experience auto-growup", () => {
    setupGoal();
    const role = getRole();

    role.achieve(`Feature: Lessons from Test Goal
  Scenario: Simplicity wins
    Given I tried a complex approach
    Then I learned to keep it simple
`);

    expect(role.focus()).toBeNull();

    const features = role.identity();
    const exp = features.find((f) => f.type === "experience");
    expect(exp).toBeDefined();
    expect(exp!.name).toBe("Lessons from Test Goal");
  });

  // ========== abandon() ==========

  test("abandon() marks goal as abandoned", () => {
    setupGoal();
    const role = getRole();

    expect(role.focus()).not.toBeNull();
    role.abandon();
    expect(role.focus()).toBeNull();
  });

  test("abandon() with experience auto-growup", () => {
    setupGoal();
    const role = getRole();

    role.abandon(`Feature: Why I Stopped
  Scenario: Scope was too big
    Given the goal was ambitious
    Then I learned to scope smaller
`);

    const features = role.identity();
    const exp = features.find((f) => f.type === "experience");
    expect(exp).toBeDefined();
    expect(exp!.name).toBe("Why I Stopped");
  });

  // ========== finish() ==========

  test("finish() marks task as done", () => {
    setupGoal();
    const role = getRole();

    role.todo(
      "my-task",
      `Feature: My Task
  Scenario: Do something
    When I act
    Then done
`,
    );

    expect(role.focus()!.tasks).toHaveLength(1);
    role.finish("my-task");

    const goal = role.focus();
    expect(goal!.tasks).toHaveLength(1);
  });

  // ========== testable ==========

  test("testable parameter marks all scenarios as verifiable", () => {
    const role = getRole();
    role.want(
      "verifiable-goal",
      `Feature: Verifiable Goal

  Scenario: First scenario
    Given a testable condition
    Then it can be automated

  Scenario: Second scenario
    Given another condition
    Then also automated
`,
      true,
    );

    const goal = role.focus();
    expect(goal!.scenarios).toHaveLength(2);
    expect(goal!.scenarios[0].verifiable).toBe(true);
    expect(goal!.scenarios[1].verifiable).toBe(true);
  });

  test("default testable=false leaves scenarios non-verifiable", () => {
    const role = getRole();
    role.want(
      "normal-goal",
      `Feature: Normal Goal

  Scenario: Just a check
    Given a one-time check
    Then done manually
`,
    );

    const goal = role.focus();
    expect(goal!.scenarios).toHaveLength(1);
    expect(goal!.scenarios[0].verifiable).toBe(false);
  });
});
