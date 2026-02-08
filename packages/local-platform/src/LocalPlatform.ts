/**
 * LocalPlatform — Local filesystem implementation of Platform.
 *
 * Everything lives under a single .rolex/ directory.
 * rolex.json is the single source of truth (CAS):
 *   - roles: all born role names
 *   - organization: optional org with teams
 *
 * Directory convention:
 *   <rootDir>/rolex.json                          <- Society config (always exists)
 *   <rootDir>/<role>/identity/*.identity.feature   <- Identity features
 *   <rootDir>/<role>/goals/<name>/<name>.goal.feature
 *   <rootDir>/<role>/goals/<name>/<name>.plan.feature
 *   <rootDir>/<role>/goals/<name>/tasks/<name>.task.feature
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join, basename } from "node:path";
import { parse } from "@rolexjs/parser";
import type { Feature as GherkinFeature } from "@rolexjs/parser";
import type {
  Platform,
  RolexConfig,
  Organization,
  RoleEntry,
  Feature,
  Scenario,
  Goal,
  Plan,
  Task,
} from "@rolexjs/core";

export class LocalPlatform implements Platform {
  private readonly rootDir: string;
  private config: RolexConfig | null = null;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  // ========== Found ==========

  found(name: string): void {
    const config = this.loadConfig();
    config.organization = {
      name,
      teams: { default: [] },
    };
    this.saveConfig(config);
  }

  // ========== Organization ==========

  organization(): Organization | null {
    const config = this.loadConfig();
    if (!config.organization) return null;

    const roles: RoleEntry[] = [];

    for (const [teamName, roleNames] of Object.entries(config.organization.teams)) {
      for (const roleName of roleNames) {
        roles.push({
          name: roleName,
          team: teamName,
        });
      }
    }

    return { name: config.organization.name, roles };
  }

  // ========== Society ==========

  allBornRoles(): string[] {
    return this.loadConfig().roles;
  }

  // ========== Born ==========

  born(name: string, source: string): Feature {
    const roleDir = join(this.rootDir, name);
    mkdirSync(join(roleDir, "identity"), { recursive: true });
    mkdirSync(join(roleDir, "goals"), { recursive: true });

    const filePath = join(roleDir, "identity", "persona.identity.feature");
    writeFileSync(filePath, source, "utf-8");

    // Register in config (CAS)
    const config = this.loadConfig();
    if (!config.roles.includes(name)) {
      config.roles.push(name);
      this.saveConfig(config);
    }

    const doc = parse(source);
    return this.toFeature(doc.feature!, "persona");
  }

  hire(name: string): void {
    const config = this.loadConfig();
    if (!config.organization) throw new Error("No organization found. Call found() first.");

    if (!config.roles.includes(name)) {
      throw new Error(`Role not found: ${name}. Call born() first.`);
    }

    // Pure config update — goals dir already exists from born()
    const [firstTeam] = Object.keys(config.organization.teams);
    if (!config.organization.teams[firstTeam].includes(name)) {
      config.organization.teams[firstTeam].push(name);
      this.saveConfig(config);
    }
  }

  fire(name: string): void {
    const config = this.loadConfig();
    if (!config.organization) throw new Error("No organization found. Call found() first.");

    // Check role is in org
    let found = false;
    for (const teamName of Object.keys(config.organization.teams)) {
      const idx = config.organization.teams[teamName].indexOf(name);
      if (idx !== -1) {
        config.organization.teams[teamName].splice(idx, 1);
        found = true;
        break;
      }
    }
    if (!found) throw new Error(`Role not hired: ${name}`);

    // Pure config update — goals are the role's own, not deleted
    this.saveConfig(config);
  }

  // ========== Growup ==========

  growup(
    roleId: string,
    type: "knowledge" | "experience" | "voice",
    name: string,
    source: string
  ): Feature {
    const roleDir = this.resolveRoleDir(roleId);
    const dir = join(roleDir, "identity");
    mkdirSync(dir, { recursive: true });

    const filePath = join(dir, `${name}.${type}.identity.feature`);
    writeFileSync(filePath, source, "utf-8");

    const doc = parse(source);
    return this.toFeature(doc.feature!, type);
  }

  // ========== Reflect ==========

  reflect(
    roleId: string,
    experienceNames: string[],
    knowledgeName: string,
    knowledgeSource: string
  ): Feature {
    const roleDir = this.resolveRoleDir(roleId);
    const identityDir = join(roleDir, "identity");

    // Delete experience files
    for (const expName of experienceNames) {
      const expFile = join(identityDir, `${expName}.experience.identity.feature`);
      if (!existsSync(expFile)) {
        throw new Error(`Experience not found: ${expName}`);
      }
      rmSync(expFile);
    }

    // Create knowledge
    return this.growup(roleId, "knowledge", knowledgeName, knowledgeSource);
  }

  // ========== Query ==========

  identity(roleId: string): Feature[] {
    const roleDir = this.resolveRoleDir(roleId);
    const dir = join(roleDir, "identity");
    if (!existsSync(dir)) return [];

    return readdirSync(dir)
      .filter((f) => f.endsWith(".identity.feature"))
      .sort()
      .map((f) => {
        const source = readFileSync(join(dir, f), "utf-8");
        const doc = parse(source);
        return this.toFeature(doc.feature!, this.detectIdentityType(f));
      });
  }

  activeGoal(roleId: string): (Goal & { plan: Plan | null; tasks: Task[] }) | null {
    const roleDir = this.resolveRoleDir(roleId);
    const goalsDir = join(roleDir, "goals");
    if (!existsSync(goalsDir)) return null;

    // If a focused goal is set, try to load it first
    const focusedName = this.getFocusedGoal(roleId);
    if (focusedName) {
      const goalDir = join(goalsDir, focusedName);
      const result = this.loadGoalIfActive(goalDir);
      if (result) return result;
    }

    // Fallback: first uncompleted goal alphabetically
    const goalDirs = readdirSync(goalsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    for (const goalName of goalDirs) {
      const goalDir = join(goalsDir, goalName);
      const result = this.loadGoalIfActive(goalDir);
      if (result) return result;
    }

    return null;
  }

  allActiveGoals(roleId: string): Goal[] {
    const roleDir = this.resolveRoleDir(roleId);
    const goalsDir = join(roleDir, "goals");
    if (!existsSync(goalsDir)) return [];

    const goalDirs = readdirSync(goalsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    const goals: Goal[] = [];
    for (const goalName of goalDirs) {
      const goalDir = join(goalsDir, goalName);
      const goalFile = this.findFeatureFile(goalDir, ".goal.feature");
      if (!goalFile) continue;

      const source = readFileSync(goalFile, "utf-8");
      const doc = parse(source);
      if (!doc.feature) continue;

      if (doc.feature.tags.some((t) => t.name === "@done" || t.name === "@abandoned")) continue;

      goals.push(this.toFeature(doc.feature, "goal") as Goal);
    }

    return goals;
  }

  getFocusedGoal(roleId: string): string | null {
    const roleDir = this.resolveRoleDir(roleId);
    const focusFile = join(roleDir, "goals", ".focus");
    if (!existsSync(focusFile)) return null;
    return readFileSync(focusFile, "utf-8").trim() || null;
  }

  setFocusedGoal(roleId: string, name: string): void {
    const roleDir = this.resolveRoleDir(roleId);
    const goalsDir = join(roleDir, "goals");
    const goalDir = join(goalsDir, name);

    if (!existsSync(goalDir)) {
      throw new Error(`Goal not found: ${name}`);
    }

    writeFileSync(join(goalsDir, ".focus"), name, "utf-8");
  }

  // ========== Write ==========

  createGoal(roleId: string, name: string, source: string, testable?: boolean): Goal {
    const roleDir = this.resolveRoleDir(roleId);
    const goalDir = join(roleDir, "goals", name);
    mkdirSync(goalDir, { recursive: true });

    if (testable) source = `@testable\n${source}`;
    const filePath = join(goalDir, `${name}.goal.feature`);
    writeFileSync(filePath, source, "utf-8");

    const doc = parse(source);
    return this.toFeature(doc.feature!, "goal") as Goal;
  }

  createPlan(roleId: string, source: string): Plan {
    const roleDir = this.resolveRoleDir(roleId);
    const goalDir = this.getActiveGoalDir(roleDir);
    if (!goalDir) throw new Error("No active goal");

    const goalName = basename(goalDir);
    const filePath = join(goalDir, `${goalName}.plan.feature`);
    writeFileSync(filePath, source, "utf-8");

    const doc = parse(source);
    return this.toFeature(doc.feature!, "plan") as Plan;
  }

  createTask(roleId: string, name: string, source: string, testable?: boolean): Task {
    const roleDir = this.resolveRoleDir(roleId);
    const goalDir = this.getActiveGoalDir(roleDir);
    if (!goalDir) throw new Error("No active goal");

    const tasksDir = join(goalDir, "tasks");
    mkdirSync(tasksDir, { recursive: true });

    if (testable) source = `@testable\n${source}`;
    const filePath = join(tasksDir, `${name}.task.feature`);
    writeFileSync(filePath, source, "utf-8");

    const doc = parse(source);
    return this.toFeature(doc.feature!, "task") as Task;
  }

  // ========== Close ==========

  completeGoal(roleId: string, experience?: string): void {
    const roleDir = this.resolveRoleDir(roleId);
    const goalDir = this.getActiveGoalDir(roleDir);
    if (!goalDir) throw new Error("No active goal");

    const goalFile = this.findFeatureFile(goalDir, ".goal.feature")!;
    this.addDoneTag(goalFile);

    if (experience) {
      const goalName = basename(goalDir);
      this.growup(roleId, "experience", goalName, experience);
    }
  }

  abandonGoal(roleId: string, experience?: string): void {
    const roleDir = this.resolveRoleDir(roleId);
    const goalDir = this.getActiveGoalDir(roleDir);
    if (!goalDir) throw new Error("No active goal");

    const goalFile = this.findFeatureFile(goalDir, ".goal.feature")!;
    this.addTag(goalFile, "@abandoned");

    if (experience) {
      const goalName = basename(goalDir);
      this.growup(roleId, "experience", goalName, experience);
    }
  }

  completeTask(roleId: string, name: string): void {
    const roleDir = this.resolveRoleDir(roleId);
    const goalDir = this.getActiveGoalDir(roleDir);
    if (!goalDir) throw new Error("No active goal");

    const tasksDir = join(goalDir, "tasks");
    const taskFile = join(tasksDir, `${name}.task.feature`);
    if (!existsSync(taskFile)) throw new Error(`Task not found: ${name}`);

    this.addDoneTag(taskFile);
  }

  // ========== Internal ==========

  /**
   * Load config — always returns a valid RolexConfig.
   * Creates default config if rolex.json doesn't exist yet.
   */
  private loadConfig(): RolexConfig {
    if (this.config) return this.config;

    const configPath = join(this.rootDir, "rolex.json");
    if (existsSync(configPath)) {
      this.config = JSON.parse(readFileSync(configPath, "utf-8"));
      return this.config!;
    }

    // Create default config
    mkdirSync(this.rootDir, { recursive: true });
    const config: RolexConfig = { roles: [], organization: null };
    this.saveConfig(config);
    return config;
  }

  private saveConfig(config: RolexConfig): void {
    mkdirSync(this.rootDir, { recursive: true });
    writeFileSync(join(this.rootDir, "rolex.json"), JSON.stringify(config, null, 2), "utf-8");
    this.config = config;
  }

  private resolveRoleDir(roleId: string): string {
    const roleDir = join(this.rootDir, roleId);
    if (!existsSync(roleDir)) {
      throw new Error(`Role directory not found: ${roleDir}`);
    }
    return roleDir;
  }

  private loadGoalIfActive(goalDir: string): (Goal & { plan: Plan | null; tasks: Task[] }) | null {
    const goalFile = this.findFeatureFile(goalDir, ".goal.feature");
    if (!goalFile) return null;

    const source = readFileSync(goalFile, "utf-8");
    const doc = parse(source);
    if (!doc.feature) return null;

    if (doc.feature.tags.some((t) => t.name === "@done" || t.name === "@abandoned")) return null;

    const goal = this.toFeature(doc.feature, "goal") as Goal;
    return {
      ...goal,
      plan: this.loadPlan(goalDir),
      tasks: this.loadTasks(goalDir),
    };
  }

  private getActiveGoalDir(roleDir: string): string | null {
    const goalsDir = join(roleDir, "goals");
    if (!existsSync(goalsDir)) return null;

    // Respect focused goal
    const focusFile = join(goalsDir, ".focus");
    if (existsSync(focusFile)) {
      const focusedName = readFileSync(focusFile, "utf-8").trim();
      if (focusedName) {
        const focusedDir = join(goalsDir, focusedName);
        if (existsSync(focusedDir) && this.loadGoalIfActive(focusedDir)) {
          return focusedDir;
        }
      }
    }

    // Fallback: first uncompleted goal
    const goalDirs = readdirSync(goalsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    for (const goalName of goalDirs) {
      const goalDir = join(goalsDir, goalName);
      if (this.loadGoalIfActive(goalDir)) {
        return goalDir;
      }
    }

    return null;
  }

  private toFeature(gherkin: GherkinFeature, type: Feature["type"]): Feature {
    return {
      ...gherkin,
      type,
      scenarios: this.extractScenarios(gherkin),
    };
  }

  private extractScenarios(feature: GherkinFeature): Scenario[] {
    const featureTestable = feature.tags.some((t) => t.name === "@testable");
    return (feature.children || [])
      .filter((c) => c.scenario)
      .map((c) => ({
        ...c.scenario!,
        verifiable: featureTestable || c.scenario!.tags.some((t) => t.name === "@testable"),
      }));
  }

  private loadPlan(goalDir: string): Plan | null {
    const planFile = this.findFeatureFile(goalDir, ".plan.feature");
    if (!planFile) return null;

    const source = readFileSync(planFile, "utf-8");
    const doc = parse(source);
    if (!doc.feature) return null;

    return this.toFeature(doc.feature, "plan") as Plan;
  }

  private loadTasks(goalDir: string): Task[] {
    const tasksDir = join(goalDir, "tasks");
    if (!existsSync(tasksDir)) return [];

    return readdirSync(tasksDir)
      .filter((f) => f.endsWith(".task.feature"))
      .sort()
      .map((f) => {
        const source = readFileSync(join(tasksDir, f), "utf-8");
        const doc = parse(source);
        return this.toFeature(doc.feature!, "task") as Task;
      });
  }

  private detectIdentityType(filename: string): Feature["type"] {
    if (filename === "persona.identity.feature") return "persona";
    if (filename.endsWith(".knowledge.identity.feature")) return "knowledge";
    if (filename.endsWith(".experience.identity.feature")) return "experience";
    if (filename.endsWith(".voice.identity.feature")) return "voice";
    return "knowledge";
  }

  private findFeatureFile(dir: string, suffix: string): string | null {
    if (!existsSync(dir)) return null;
    const file = readdirSync(dir).find((f) => f.endsWith(suffix));
    return file ? join(dir, file) : null;
  }

  private addTag(filePath: string, tag: string): void {
    const content = readFileSync(filePath, "utf-8");
    const updated = content.replace(/^(Feature:)/m, `${tag}\n$1`);
    writeFileSync(filePath, updated, "utf-8");
  }

  private addDoneTag(filePath: string): void {
    this.addTag(filePath, "@done");
  }
}
