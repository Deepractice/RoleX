/**
 * LocalPlatform — Local filesystem implementation of Platform.
 *
 * Everything lives under a single .rolex/ directory.
 * rolex.json is the single source of truth (CAS):
 *   - roles: all born role names
 *   - organizations: org configs with positions
 *   - assignments: role → org/position mappings
 *
 * Directory convention:
 *   <rootDir>/rolex.json
 *   <rootDir>/roles/<role>/identity/*.identity.feature
 *   <rootDir>/roles/<role>/goals/<name>/<name>.goal.feature
 *   <rootDir>/roles/<role>/goals/<name>/<name>.plan.feature
 *   <rootDir>/roles/<role>/goals/<name>/tasks/<name>.task.feature
 *   <rootDir>/orgs/<org>/org.feature                            (optional)
 *   <rootDir>/orgs/<org>/positions/<name>/<name>.position.feature
 *   <rootDir>/orgs/<org>/positions/<name>/*.duty.feature
 *   <rootDir>/skills/<name>/<name>.skill.feature
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join, basename } from "node:path";
import { parse } from "@rolexjs/parser";
import type { Feature as GherkinFeature } from "@rolexjs/parser";
import type {
  Platform,
  RolexConfig,
  OrganizationInfo,
  PositionInfo,
  SkillInfo,
  Assignment,
  Feature,
  Scenario,
  Goal,
  Plan,
  Task,
  Duty,
  Skill,
} from "@rolexjs/core";
import {
  getRoleState,
  getPositionState,
  transition,
  ROLE_MACHINE,
  POSITION_MACHINE,
} from "@rolexjs/core";

export class LocalPlatform implements Platform {
  private readonly rootDir: string;
  private config: RolexConfig | null = null;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  // ========== Society ==========

  allBornRoles(): string[] {
    return this.loadConfig().roles;
  }

  born(name: string, source: string): Feature {
    const roleDir = join(this.rootDir, "roles", name);
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

  found(name: string, source?: string, parent?: string): void {
    const config = this.loadConfig();

    if (config.organizations[name]) {
      throw new Error(`Organization already exists: ${name}`);
    }

    if (parent && !config.organizations[parent]) {
      throw new Error(`Parent organization not found: ${parent}`);
    }

    // Create org directory
    const orgDir = join(this.rootDir, "orgs", name);
    mkdirSync(orgDir, { recursive: true });

    // Write optional org feature
    if (source) {
      writeFileSync(join(orgDir, "org.feature"), source, "utf-8");
    }

    // Register in config
    config.organizations[name] = {
      parent,
      positions: [],
    };
    this.saveConfig(config);
  }

  getOrganization(name: string): OrganizationInfo | null {
    const config = this.loadConfig();
    const orgConfig = config.organizations[name];
    if (!orgConfig) return null;

    const members = Object.entries(config.assignments)
      .filter(([, a]) => a.org === name)
      .map(([role]) => role);

    return {
      name,
      parent: orgConfig.parent,
      positions: orgConfig.positions,
      members,
    };
  }

  allOrganizations(): OrganizationInfo[] {
    const config = this.loadConfig();
    return Object.keys(config.organizations).map((name) => this.getOrganization(name)!);
  }

  // ========== Organization ==========

  hire(roleId: string, orgName: string): void {
    const config = this.loadConfig();

    if (!config.roles.includes(roleId)) {
      throw new Error(`Role not found: ${roleId}. Call born() first.`);
    }
    if (!config.organizations[orgName]) {
      throw new Error(`Organization not found: ${orgName}. Call found() first.`);
    }

    const assignment = config.assignments[roleId] ?? null;
    const currentState = getRoleState(assignment);

    // Validate state transition
    transition(ROLE_MACHINE, currentState, "hire");

    // One-to-one: role can only belong to one org
    if (assignment && assignment.org !== orgName) {
      throw new Error(`Role "${roleId}" is already hired in organization "${assignment.org}"`);
    }

    config.assignments[roleId] = { org: orgName };
    this.saveConfig(config);
  }

  fire(roleId: string, orgName: string): void {
    const config = this.loadConfig();

    const assignment = config.assignments[roleId];
    if (!assignment || assignment.org !== orgName) {
      throw new Error(`Role "${roleId}" is not hired in organization "${orgName}"`);
    }

    const currentState = getRoleState(assignment);

    // Validate state transition (fire works from member or on_duty)
    transition(ROLE_MACHINE, currentState, "fire");

    // Auto-dismiss: if on_duty, clear position state first
    if (assignment.position) {
      // No need to explicitly transition position — just removing assignment
    }

    delete config.assignments[roleId];
    this.saveConfig(config);
  }

  establish(positionName: string, source: string, orgName: string): void {
    const config = this.loadConfig();

    if (!config.organizations[orgName]) {
      throw new Error(`Organization not found: ${orgName}. Call found() first.`);
    }

    if (config.organizations[orgName].positions.includes(positionName)) {
      throw new Error(`Position "${positionName}" already exists in organization "${orgName}"`);
    }

    // Create position directory
    const posDir = join(this.rootDir, "orgs", orgName, "positions", positionName);
    mkdirSync(posDir, { recursive: true });

    // Write position feature
    writeFileSync(join(posDir, `${positionName}.position.feature`), source, "utf-8");

    // Register in config
    config.organizations[orgName].positions.push(positionName);
    this.saveConfig(config);
  }

  appoint(roleId: string, positionName: string, orgName: string): void {
    const config = this.loadConfig();

    // Validate role is member of this org
    const assignment = config.assignments[roleId];
    if (!assignment || assignment.org !== orgName) {
      throw new Error(`Role "${roleId}" is not a member of organization "${orgName}". Hire first.`);
    }

    // Validate position exists in org
    if (!config.organizations[orgName]?.positions.includes(positionName)) {
      throw new Error(`Position "${positionName}" not found in organization "${orgName}"`);
    }

    // Validate role state transition (member → on_duty)
    const roleState = getRoleState(assignment);
    transition(ROLE_MACHINE, roleState, "appoint");

    // Validate position state transition (vacant → filled)
    const currentHolder = this.findPositionHolder(config, orgName, positionName);
    const posState = getPositionState(currentHolder);
    transition(POSITION_MACHINE, posState, "appoint");

    // Update assignment
    config.assignments[roleId] = { org: orgName, position: positionName };
    this.saveConfig(config);
  }

  dismiss(roleId: string): void {
    const config = this.loadConfig();

    const assignment = config.assignments[roleId];
    if (!assignment || !assignment.position) {
      throw new Error(`Role "${roleId}" is not appointed to any position`);
    }

    // Validate role state transition (on_duty → member)
    const roleState = getRoleState(assignment);
    transition(ROLE_MACHINE, roleState, "dismiss");

    // Update assignment — keep org, remove position
    config.assignments[roleId] = { org: assignment.org };
    this.saveConfig(config);
  }

  positionDuties(positionName: string, orgName: string): Duty[] {
    const posDir = join(this.rootDir, "orgs", orgName, "positions", positionName);
    if (!existsSync(posDir)) return [];

    return readdirSync(posDir)
      .filter((f) => f.endsWith(".duty.feature"))
      .sort()
      .map((f) => {
        const source = readFileSync(join(posDir, f), "utf-8");
        const doc = parse(source);
        return this.toFeature(doc.feature!, "duty") as Duty;
      });
  }

  getAssignment(roleId: string): Assignment | null {
    const config = this.loadConfig();
    return config.assignments[roleId] ?? null;
  }

  getPosition(positionName: string, orgName: string): PositionInfo | null {
    const config = this.loadConfig();

    if (!config.organizations[orgName]?.positions.includes(positionName)) {
      return null;
    }

    const holder = this.findPositionHolder(config, orgName, positionName);
    const duties = this.positionDuties(positionName, orgName);

    return {
      name: positionName,
      org: orgName,
      state: getPositionState(holder),
      assignedRole: holder,
      duties,
    };
  }

  // ========== Skill ==========

  createSkill(name: string, source: string): Skill {
    const skillDir = join(this.rootDir, "skills", name);
    mkdirSync(skillDir, { recursive: true });

    writeFileSync(join(skillDir, `${name}.skill.feature`), source, "utf-8");

    const config = this.loadConfig();
    if (!config.skills.includes(name)) {
      config.skills.push(name);
      this.saveConfig(config);
    }

    const doc = parse(source);
    return this.toFeature(doc.feature!, "skill") as Skill;
  }

  allSkills(): SkillInfo[] {
    const config = this.loadConfig();
    return config.skills.map((name) => this.getSkill(name)!).filter(Boolean);
  }

  getSkill(name: string): SkillInfo | null {
    const config = this.loadConfig();
    if (!config.skills.includes(name)) return null;

    const equippedBy = Object.entries(config.equipment)
      .filter(([, skills]) => skills.includes(name))
      .map(([roleId]) => roleId);

    return { name, equippedBy };
  }

  equip(roleId: string, skillName: string): void {
    const config = this.loadConfig();

    if (!config.roles.includes(roleId)) {
      throw new Error(`Role not found: ${roleId}. Call born() first.`);
    }
    if (!config.skills.includes(skillName)) {
      throw new Error(`Skill not found: ${skillName}. Call createSkill() first.`);
    }

    if (!config.equipment[roleId]) {
      config.equipment[roleId] = [];
    }

    // Idempotent
    if (!config.equipment[roleId].includes(skillName)) {
      config.equipment[roleId].push(skillName);
      this.saveConfig(config);
    }
  }

  unequip(roleId: string, skillName: string): void {
    const config = this.loadConfig();

    const equipped = config.equipment[roleId];
    if (!equipped || !equipped.includes(skillName)) {
      throw new Error(`Role "${roleId}" does not have skill "${skillName}" equipped`);
    }

    config.equipment[roleId] = equipped.filter((s) => s !== skillName);
    if (config.equipment[roleId].length === 0) {
      delete config.equipment[roleId];
    }
    this.saveConfig(config);
  }

  roleSkills(roleId: string): Skill[] {
    const config = this.loadConfig();
    const equipped = config.equipment[roleId] ?? [];

    return equipped
      .map((skillName) => {
        const skillDir = join(this.rootDir, "skills", skillName);
        const skillFile = join(skillDir, `${skillName}.skill.feature`);
        if (!existsSync(skillFile)) return null;

        const source = readFileSync(skillFile, "utf-8");
        const doc = parse(source);
        return this.toFeature(doc.feature!, "skill") as Skill;
      })
      .filter(Boolean) as Skill[];
  }

  // ========== Role Identity ==========

  identity(roleId: string): Feature[] {
    const roleDir = this.resolveRoleDir(roleId);
    const dir = join(roleDir, "identity");
    if (!existsSync(dir)) return [];

    // Personal identity features
    const features = readdirSync(dir)
      .filter((f) => f.endsWith(".identity.feature"))
      .sort()
      .map((f) => {
        const source = readFileSync(join(dir, f), "utf-8");
        const doc = parse(source);
        return this.toFeature(doc.feature!, this.detectIdentityType(f));
      });

    // Inject duty features if on_duty
    const assignment = this.getAssignment(roleId);
    if (assignment?.position) {
      const duties = this.positionDuties(assignment.position, assignment.org);
      features.push(...duties);
    }

    // Inject equipped skill features
    const skills = this.roleSkills(roleId);
    features.push(...skills);

    return features;
  }

  // ========== Identity Dimensions ==========

  addIdentity(
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
    if (experienceNames.length === 0) {
      throw new Error("At least one experience required");
    }

    const roleDir = this.resolveRoleDir(roleId);
    const identityDir = join(roleDir, "identity");

    // Phase 1: Validate ALL experiences exist before any mutation
    const expFiles: string[] = [];
    for (const expName of experienceNames) {
      if (expName.includes("/") || expName.includes("\\") || expName.includes("..")) {
        throw new Error(`Invalid experience name: ${expName}`);
      }
      const expFile = join(identityDir, `${expName}.experience.identity.feature`);
      if (!existsSync(expFile)) {
        throw new Error(`Experience not found: ${expName}`);
      }
      expFiles.push(expFile);
    }

    // Phase 2: Create knowledge FIRST (safe — if this fails, nothing is lost)
    const feature = this.addIdentity(roleId, "knowledge", knowledgeName, knowledgeSource);

    // Phase 3: Delete experience files (only after knowledge is safely persisted)
    for (const expFile of expFiles) {
      rmSync(expFile);
    }

    return feature;
  }

  // ========== Goals ==========

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
      this.addIdentity(roleId, "experience", goalName, experience);
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
      this.addIdentity(roleId, "experience", goalName, experience);
    }
  }

  completeTask(roleId: string, name: string, experience?: string): void {
    const roleDir = this.resolveRoleDir(roleId);
    const goalDir = this.getActiveGoalDir(roleDir);
    if (!goalDir) throw new Error("No active goal");

    const tasksDir = join(goalDir, "tasks");
    const taskFile = join(tasksDir, `${name}.task.feature`);
    if (!existsSync(taskFile)) throw new Error(`Task not found: ${name}`);

    this.addDoneTag(taskFile);

    if (experience) {
      this.addIdentity(roleId, "experience", name, experience);
    }
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
      const raw = JSON.parse(readFileSync(configPath, "utf-8"));
      // Migrate old format: ensure required fields exist
      this.config = {
        roles: raw.roles ?? [],
        organizations: raw.organizations ?? {},
        assignments: raw.assignments ?? {},
        skills: raw.skills ?? [],
        equipment: raw.equipment ?? {},
      };
      return this.config;
    }

    // Create default config
    mkdirSync(this.rootDir, { recursive: true });
    const config: RolexConfig = {
      roles: [],
      organizations: {},
      assignments: {},
      skills: [],
      equipment: {},
    };
    this.saveConfig(config);
    return config;
  }

  private saveConfig(config: RolexConfig): void {
    mkdirSync(this.rootDir, { recursive: true });
    writeFileSync(join(this.rootDir, "rolex.json"), JSON.stringify(config, null, 2), "utf-8");
    this.config = config;
  }

  private resolveRoleDir(roleId: string): string {
    const roleDir = join(this.rootDir, "roles", roleId);
    if (!existsSync(roleDir)) {
      throw new Error(`Role directory not found: ${roleDir}`);
    }
    return roleDir;
  }

  private findPositionHolder(
    config: RolexConfig,
    orgName: string,
    positionName: string
  ): string | null {
    for (const [role, assignment] of Object.entries(config.assignments)) {
      if (assignment.org === orgName && assignment.position === positionName) {
        return role;
      }
    }
    return null;
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
