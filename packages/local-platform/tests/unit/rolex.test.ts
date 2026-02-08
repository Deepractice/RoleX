import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { Rolex, Organization, Role, Position } from "rolexjs";
import { LocalPlatform } from "../../src/LocalPlatform.js";

const TEST_ROOT = join(import.meta.dir, "../.test-rolex");
const ROLEX_DIR = join(TEST_ROOT, ".rolex");
const ROLE_NAME = "owner";

function setupTestOrg() {
  const roleDir = join(ROLEX_DIR, "roles", "owner");
  mkdirSync(join(roleDir, "identity"), { recursive: true });
  mkdirSync(join(roleDir, "goals"), { recursive: true });

  // rolex.json — new v2 RolexConfig format
  writeFileSync(
    join(ROLEX_DIR, "rolex.json"),
    JSON.stringify({
      roles: ["owner"],
      organizations: {
        "Test Org": { positions: [] },
      },
      assignments: {
        owner: { org: "Test Org" },
      },
    })
  );

  writeFileSync(
    join(roleDir, "identity", "001-basics.identity.feature"),
    `@rolex @owner @identity
Feature: Basic Knowledge
  Scenario: Owner knows the basics
    Given the role model exists
    Then everything is a Feature
`
  );

  writeFileSync(
    join(roleDir, "identity", "002-principles.identity.feature"),
    `@rolex @owner @identity
Feature: Core Principles
  Scenario: Gherkin is first-class
    Given Gherkin covers all dimensions
    Then no new format needed
`
  );
}

function setupGoal() {
  const goalDir = join(ROLEX_DIR, "roles", "owner", "goals", "test-goal");
  mkdirSync(goalDir, { recursive: true });

  writeFileSync(
    join(goalDir, "test-goal.goal.feature"),
    `@rolex @owner @goal
Feature: Test Goal
  Scenario: Deliver something
    Given a requirement
    When I implement it
    Then it works
`
  );
}

function setupDoneGoal() {
  const goalDir = join(ROLEX_DIR, "roles", "owner", "goals", "done-goal");
  mkdirSync(goalDir, { recursive: true });

  writeFileSync(
    join(goalDir, "done-goal.goal.feature"),
    `@rolex @owner @goal @done
Feature: Completed Goal
  Scenario: Already done
    Given it was done
    Then it is marked done
`
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
`
    );

    expect(persona.type).toBe("persona");
    expect(persona.name).toBe("Alex");

    expect(
      existsSync(join(ROLEX_DIR, "roles", "alex", "identity", "persona.identity.feature"))
    ).toBe(true);
    expect(existsSync(join(ROLEX_DIR, "roles", "alex", "goals"))).toBe(true);
  });

  // ========== found() ==========

  test("found() creates organization config", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    rolex.found("Deepractice");

    const dir = rolex.directory();
    expect(dir.organizations.find((o) => o.name === "Deepractice")).toBeDefined();
  });

  test("found() with parent creates nested organization", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    rolex.found("Engineering", undefined, "Test Org");

    const dir = rolex.directory();
    const eng = dir.organizations.find((o) => o.name === "Engineering");
    expect(eng).toBeDefined();
    expect(eng!.parent).toBe("Test Org");
  });

  test("found() throws for duplicate org name", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    expect(() => rolex.found("Test Org")).toThrow("Organization already exists");
  });

  test("found() throws for non-existent parent", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    expect(() => rolex.found("Sub", undefined, "NoOrg")).toThrow("Parent organization not found");
  });

  // ========== establish() ==========

  test("establish() creates a position in an organization", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    rolex.establish(
      "architect",
      `Feature: Backend Architect
  Scenario: Review code
    Given a pull request
    Then I review for architecture consistency
`,
      "Test Org"
    );

    const dir = rolex.directory();
    const org = dir.organizations.find((o) => o.name === "Test Org");
    expect(org!.positions).toContain("architect");
    expect(
      existsSync(
        join(ROLEX_DIR, "orgs", "Test Org", "positions", "architect", "architect.position.feature")
      )
    ).toBe(true);
  });

  test("establish() throws for duplicate position name", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    rolex.establish(
      "architect",
      `Feature: Architect\n  Scenario: A\n    Given x\n    Then y\n`,
      "Test Org"
    );
    expect(() =>
      rolex.establish(
        "architect",
        `Feature: Architect\n  Scenario: B\n    Given x\n    Then y\n`,
        "Test Org"
      )
    ).toThrow("already exists");
  });

  // ========== directory() ==========

  test("directory() returns all roles with states and organizations with positions", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    const dir = rolex.directory();

    expect(dir.organizations).toHaveLength(1);
    expect(dir.organizations[0].name).toBe("Test Org");
    expect(dir.roles.length).toBeGreaterThan(0);

    const owner = dir.roles.find((r) => r.name === "owner");
    expect(owner).toBeDefined();
    expect(owner!.state).toBe("member");
    expect(owner!.org).toBe("Test Org");
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

  test("find() returns Position for position name", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    rolex.establish(
      "architect",
      `Feature: Architect\n  Scenario: A\n    Given x\n    Then y\n`,
      "Test Org"
    );

    const result = rolex.find("architect");
    expect(result).toBeInstanceOf(Position);
  });

  test("find() throws for unknown name", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    expect(() => rolex.find("nobody")).toThrow("Not found in society");
  });

  test("loadConfig() migrates old format without roles/organizations/assignments", () => {
    // Write an old-format rolex.json (missing required fields)
    writeFileSync(join(ROLEX_DIR, "rolex.json"), JSON.stringify({ name: "legacy" }));

    const platform = new LocalPlatform(ROLEX_DIR);
    const roles = platform.allBornRoles();
    expect(roles).toEqual([]);
  });

  test("loadConfig() preserves existing fields during migration", () => {
    // Write a config with only roles (missing organizations/assignments)
    writeFileSync(join(ROLEX_DIR, "rolex.json"), JSON.stringify({ roles: ["alice"] }));

    const platform = new LocalPlatform(ROLEX_DIR);
    expect(platform.allBornRoles()).toEqual(["alice"]);
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

  test("info() returns org structure with members", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    const org = rolex.find("Test Org") as Organization;
    const info = org.info();

    expect(info.name).toBe("Test Org");
    expect(info.members).toContain("owner");
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
`
    );

    org.hire("alex");

    const info = org.info();
    expect(info.members).toContain("alex");

    const dir = rolex.directory();
    const alex = dir.roles.find((r) => r.name === "alex");
    expect(alex!.state).toBe("member");
    expect(alex!.org).toBe("Test Org");
  });

  test("hire() throws if role not born", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    const org = rolex.find("Test Org") as Organization;
    expect(() => org.hire("nobody")).toThrow("Role not found");
  });

  test("hire() throws if role already hired (state machine)", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    const org = rolex.find("Test Org") as Organization;
    // owner is already member
    expect(() => org.hire("owner")).toThrow("Invalid transition");
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
`
    );
    org.hire("temp");

    org.fire("temp");

    const dir = rolex.directory();
    const temp = dir.roles.find((r) => r.name === "temp");
    expect(temp!.state).toBe("free");
    expect(temp!.org).toBeUndefined();
  });

  test("fire() auto-dismisses on_duty role", () => {
    const platform = new LocalPlatform(ROLEX_DIR);
    const rolex = new Rolex(platform);
    const org = rolex.find("Test Org") as Organization;

    // Establish position and appoint owner
    rolex.establish(
      "lead",
      `Feature: Lead\n  Scenario: Lead\n    Given x\n    Then y\n`,
      "Test Org"
    );
    org.appoint("owner", "lead");

    const dirBefore = rolex.directory();
    expect(dirBefore.roles.find((r) => r.name === "owner")!.state).toBe("on_duty");

    // Fire auto-dismisses
    org.fire("owner");

    const dirAfter = rolex.directory();
    expect(dirAfter.roles.find((r) => r.name === "owner")!.state).toBe("free");
  });

  // ========== appoint() / dismiss() ==========

  test("appoint() assigns a member to a position", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    const org = rolex.find("Test Org") as Organization;

    rolex.establish(
      "architect",
      `Feature: Architect\n  Scenario: A\n    Given x\n    Then y\n`,
      "Test Org"
    );
    org.appoint("owner", "architect");

    const dir = rolex.directory();
    const owner = dir.roles.find((r) => r.name === "owner");
    expect(owner!.state).toBe("on_duty");
    expect(owner!.position).toBe("architect");
  });

  test("appoint() throws for non-member", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    const org = rolex.find("Test Org") as Organization;
    rolex.born("free-agent", `Feature: FA\n  Scenario: A\n    Given x\n    Then y\n`);
    rolex.establish("pos", `Feature: Pos\n  Scenario: A\n    Given x\n    Then y\n`, "Test Org");

    expect(() => org.appoint("free-agent", "pos")).toThrow("not a member");
  });

  test("appoint() throws for filled position (one-to-one)", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    const org = rolex.find("Test Org") as Organization;

    rolex.establish("pos", `Feature: Pos\n  Scenario: A\n    Given x\n    Then y\n`, "Test Org");
    org.appoint("owner", "pos");

    // Try appointing another role to same position
    rolex.born("alex", `Feature: Alex\n  Scenario: A\n    Given x\n    Then y\n`);
    org.hire("alex");
    expect(() => org.appoint("alex", "pos")).toThrow("Invalid transition");
  });

  test("dismiss() returns role to member", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    const org = rolex.find("Test Org") as Organization;

    rolex.establish("pos", `Feature: Pos\n  Scenario: A\n    Given x\n    Then y\n`, "Test Org");
    org.appoint("owner", "pos");

    expect(rolex.directory().roles.find((r) => r.name === "owner")!.state).toBe("on_duty");

    org.dismiss("owner");

    const dir = rolex.directory();
    expect(dir.roles.find((r) => r.name === "owner")!.state).toBe("member");
    expect(dir.roles.find((r) => r.name === "owner")!.position).toBeUndefined();
  });

  test("dismiss() throws for non-appointed role", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    const org = rolex.find("Test Org") as Organization;

    expect(() => org.dismiss("owner")).toThrow("not appointed");
  });

  // ========== teach() ==========

  test("teach() adds knowledge to a role", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));

    const feature = rolex.teach(
      ROLE_NAME,
      "knowledge",
      "company-policy",
      `Feature: Company Policy
  Scenario: We ship weekly
    Given a development cycle
    Then we release every Friday
`
    );

    expect(feature.type).toBe("knowledge");
    expect(feature.name).toBe("Company Policy");
  });
});

describe("Identity with duties", () => {
  beforeEach(() => {
    rmSync(TEST_ROOT, { recursive: true, force: true });
    setupTestOrg();
  });

  afterEach(() => {
    rmSync(TEST_ROOT, { recursive: true, force: true });
  });

  test("on_duty role gets position duties injected into identity", () => {
    const platform = new LocalPlatform(ROLEX_DIR);
    const rolex = new Rolex(platform);
    const org = rolex.find("Test Org") as Organization;

    // Establish position
    rolex.establish(
      "architect",
      `Feature: Architect\n  Scenario: A\n    Given x\n    Then y\n`,
      "Test Org"
    );

    // Add duty files
    const dutyDir = join(ROLEX_DIR, "orgs", "Test Org", "positions", "architect");
    writeFileSync(
      join(dutyDir, "code-review.duty.feature"),
      `Feature: Code Review Duties
  Scenario: Review pull requests
    Given a PR is submitted
    Then I review for architecture consistency
`
    );

    // Appoint
    org.appoint("owner", "architect");

    // Identity should include personal features + duty features
    const role = rolex.role("owner");
    const features = role.identity();

    const dutyFeatures = features.filter((f) => f.type === "duty");
    expect(dutyFeatures).toHaveLength(1);
    expect(dutyFeatures[0].name).toBe("Code Review Duties");
  });

  test("member role does NOT get duties", () => {
    const platform = new LocalPlatform(ROLEX_DIR);
    const rolex = new Rolex(platform);

    // owner is member but not appointed
    const role = rolex.role("owner");
    const features = role.identity();

    const dutyFeatures = features.filter((f) => f.type === "duty");
    expect(dutyFeatures).toHaveLength(0);
  });
});

describe("State machine validation", () => {
  beforeEach(() => {
    rmSync(TEST_ROOT, { recursive: true, force: true });
    setupTestOrg();
  });

  afterEach(() => {
    rmSync(TEST_ROOT, { recursive: true, force: true });
  });

  test("cannot appoint a free role (must hire first)", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    const org = rolex.find("Test Org") as Organization;
    rolex.born("free-guy", `Feature: Free\n  Scenario: A\n    Given x\n    Then y\n`);
    rolex.establish("pos", `Feature: Pos\n  Scenario: A\n    Given x\n    Then y\n`, "Test Org");

    expect(() => org.appoint("free-guy", "pos")).toThrow("not a member");
  });

  test("cannot hire an already-member role", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    const org = rolex.find("Test Org") as Organization;

    expect(() => org.hire("owner")).toThrow("Invalid transition");
  });

  test("cannot dismiss a member (not on_duty)", () => {
    const rolex = new Rolex(new LocalPlatform(ROLEX_DIR));
    const org = rolex.find("Test Org") as Organization;

    expect(() => org.dismiss("owner")).toThrow("not appointed");
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
`
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
`
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
`
    );

    expect(feature.type).toBe("voice");
    expect(feature.name).toBe("Direct Communication");
  });

  // ========== focus() ==========

  test("focus() returns null current when no goals", () => {
    const role = getRole();
    const { current, otherGoals } = role.focus();
    expect(current).toBeNull();
    expect(otherGoals).toEqual([]);
  });

  test("focus() returns first active goal", () => {
    setupGoal();
    const role = getRole();
    const { current } = role.focus();

    expect(current).not.toBeNull();
    expect(current!.type).toBe("goal");
    expect(current!.name).toBe("Test Goal");
  });

  test("focus() skips @done goals", () => {
    setupDoneGoal();
    const role = getRole();
    const { current } = role.focus();
    expect(current).toBeNull();
  });

  test("focus() includes plan and tasks context", () => {
    setupGoal();
    const role = getRole();
    const { current } = role.focus();

    expect(current!.plan).toBeNull();
    expect(current!.tasks).toEqual([]);
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
`
    );

    expect(goal.type).toBe("goal");
    expect(goal.name).toBe("New Feature");

    const { current: active } = role.focus();
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
`
    );

    expect(plan.type).toBe("plan");
    expect(plan.name).toBe("Implementation Plan");

    const { current: goal } = role.focus();
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
`
    );

    expect(task.type).toBe("task");
    expect(task.name).toBe("Implement Loader");

    const { current: goal } = role.focus();
    expect(goal!.tasks).toHaveLength(1);
  });

  // ========== achieve() ==========

  test("achieve() marks active goal as done", () => {
    setupGoal();
    const role = getRole();

    expect(role.focus().current).not.toBeNull();
    role.achieve();
    expect(role.focus().current).toBeNull();
  });

  test("achieve() with experience auto-growup", () => {
    setupGoal();
    const role = getRole();

    role.achieve(`Feature: Lessons from Test Goal
  Scenario: Simplicity wins
    Given I tried a complex approach
    Then I learned to keep it simple
`);

    expect(role.focus().current).toBeNull();

    const features = role.identity();
    const exp = features.find((f) => f.type === "experience");
    expect(exp).toBeDefined();
    expect(exp!.name).toBe("Lessons from Test Goal");
  });

  // ========== abandon() ==========

  test("abandon() marks goal as abandoned", () => {
    setupGoal();
    const role = getRole();

    expect(role.focus().current).not.toBeNull();
    role.abandon();
    expect(role.focus().current).toBeNull();
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
`
    );

    expect(role.focus().current!.tasks).toHaveLength(1);
    role.finish("my-task");

    const { current: goal } = role.focus();
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
      true
    );

    const { current: goal } = role.focus();
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
`
    );

    const { current: goal } = role.focus();
    expect(goal!.scenarios).toHaveLength(1);
    expect(goal!.scenarios[0].verifiable).toBe(false);
  });
});
