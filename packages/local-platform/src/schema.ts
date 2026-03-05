/**
 * Drizzle schema — SQLite tables for RoleX.
 *
 * Five tables:
 *   nodes                — tree backbone (Structure instances)
 *   links                — cross-branch relations (bidirectional)
 *   prototypes           — which prototype packages are settled
 *   contexts             — per-role session focus state
 *   prototype_migrations — Flyway-style migration history
 */

import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * nodes — every node in the society graph.
 *
 * Maps 1:1 to the Structure interface:
 *   ref         → graph-internal reference (primary key)
 *   id          → user-facing kebab-case identifier
 *   alias       → JSON array of alternative names
 *   name        → structure type ("individual", "goal", "task", etc.)
 *   description → what this structure is
 *   parent_ref  → tree parent (self-referencing foreign key)
 *   information → Gherkin Feature source text
 *   tag         → generic label ("done", "abandoned")
 */
export const nodes = sqliteTable(
  "nodes",
  {
    ref: text("ref").primaryKey(),
    id: text("id"),
    alias: text("alias"), // JSON array: '["Sean","姜山"]'
    name: text("name").notNull(),
    description: text("description").default(""),
    parentRef: text("parent_ref").references((): any => nodes.ref),
    information: text("information"),
    tag: text("tag"),
  },
  (table) => [
    index("idx_nodes_id").on(table.id),
    index("idx_nodes_name").on(table.name),
    index("idx_nodes_parent_ref").on(table.parentRef),
  ]
);

/**
 * links — cross-branch relations between nodes.
 *
 * Bidirectional: if A→B is "membership", B→A is "belong".
 * Both directions stored as separate rows.
 */
export const links = sqliteTable(
  "links",
  {
    fromRef: text("from_ref")
      .notNull()
      .references(() => nodes.ref),
    toRef: text("to_ref")
      .notNull()
      .references(() => nodes.ref),
    relation: text("relation").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.fromRef, table.toRef, table.relation] }),
    index("idx_links_from").on(table.fromRef),
    index("idx_links_to").on(table.toRef),
  ]
);

/**
 * prototypes — which prototype packages are settled.
 */
export const prototypes = sqliteTable("prototypes", {
  id: text("id").primaryKey(),
  source: text("source").notNull(),
});

/**
 * contexts — per-role session focus state.
 */
export const contexts = sqliteTable("contexts", {
  roleId: text("role_id").primaryKey(),
  focusedGoalId: text("focused_goal_id"),
  focusedPlanId: text("focused_plan_id"),
});

/**
 * prototype_migrations — Flyway-style migration history.
 *
 * Records which migrations have been executed for each prototype.
 */
export const prototypeMigrations = sqliteTable(
  "prototype_migrations",
  {
    prototypeId: text("prototype_id").notNull(),
    migrationId: text("migration_id").notNull(),
    version: integer("version").notNull(),
    checksum: text("checksum").notNull(),
    executedAt: text("executed_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.prototypeId, table.migrationId] })]
);
