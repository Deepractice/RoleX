/**
 * Drizzle schema — SQLite tables for the RoleX runtime graph.
 *
 * Two tables:
 *   nodes — tree backbone (Structure instances)
 *   links — cross-branch relations (bidirectional)
 */

import { index, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
