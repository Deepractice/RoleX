/**
 * SQLite-backed Runtime — single source of truth.
 *
 * Every operation reads/writes directly to SQLite.
 * No in-memory Map, no load/save cycle, no stale refs.
 */

import type { CommonXDatabase } from "@deepracticex/drizzle";
import type { Runtime, State, Structure } from "@rolexjs/system";
import { and, eq, isNull } from "drizzle-orm";
import { links, nodes } from "./schema.js";

type DB = CommonXDatabase;

// ===== Helpers =====

function nextRef(db: DB): string {
  const max = db
    .select({ ref: nodes.ref })
    .from(nodes)
    .all()
    .reduce((max, r) => {
      const n = parseInt(r.ref.slice(1), 10);
      return Number.isNaN(n) ? max : Math.max(max, n);
    }, 0);
  return `n${max + 1}`;
}

function toStructure(row: typeof nodes.$inferSelect): Structure {
  return {
    ref: row.ref,
    ...(row.id ? { id: row.id } : {}),
    ...(row.alias ? { alias: JSON.parse(row.alias) } : {}),
    name: row.name,
    description: row.description ?? "",
    parent: null, // Runtime doesn't use parent as Structure; tree is via parentRef
    ...(row.information ? { information: row.information } : {}),
    ...(row.tag ? { tag: row.tag } : {}),
  };
}

// ===== Projection =====

function projectNode(db: DB, ref: string): State {
  const row = db.select().from(nodes).where(eq(nodes.ref, ref)).get();
  if (!row) throw new Error(`Node not found: ${ref}`);

  const children = db.select().from(nodes).where(eq(nodes.parentRef, ref)).all();

  const nodeLinks = db.select().from(links).where(eq(links.fromRef, ref)).all();

  return {
    ...toStructure(row),
    children: children.map((c) => projectNode(db, c.ref)),
    ...(nodeLinks.length > 0
      ? {
          links: nodeLinks.map((l) => ({
            relation: l.relation,
            target: projectLinked(db, l.toRef),
          })),
        }
      : {}),
  };
}

/** Project a node with full subtree but without following links (prevents cycles). */
function projectLinked(db: DB, ref: string): State {
  const row = db.select().from(nodes).where(eq(nodes.ref, ref)).get();
  if (!row) throw new Error(`Node not found: ${ref}`);
  const children = db.select().from(nodes).where(eq(nodes.parentRef, ref)).all();
  return {
    ...toStructure(row),
    children: children.map((c) => projectLinked(db, c.ref)),
  };
}

// ===== Subtree removal =====

function removeSubtree(db: DB, ref: string): void {
  // Remove children first (depth-first)
  const children = db.select({ ref: nodes.ref }).from(nodes).where(eq(nodes.parentRef, ref)).all();
  for (const child of children) {
    removeSubtree(db, child.ref);
  }

  // Remove links from/to this node
  db.delete(links).where(eq(links.fromRef, ref)).run();
  db.delete(links).where(eq(links.toRef, ref)).run();

  // Remove the node itself
  db.delete(nodes).where(eq(nodes.ref, ref)).run();
}

// ===== Runtime factory =====

export function createSqliteRuntime(db: DB): Runtime {
  return {
    create(parent, type, information, id, alias) {
      // Global uniqueness: no duplicate ids anywhere in the tree.
      if (id) {
        const existing = db.select().from(nodes).where(eq(nodes.id, id)).get();
        if (existing) {
          // Idempotent: same id under same parent → return existing.
          if (existing.parentRef === (parent?.ref ?? null)) return toStructure(existing);
          throw new Error(`Duplicate id "${id}": already exists elsewhere in the tree.`);
        }
      }
      const ref = nextRef(db);
      db.insert(nodes)
        .values({
          ref,
          id: id ?? null,
          alias: alias && alias.length > 0 ? JSON.stringify(alias) : null,
          name: type.name,
          description: type.description,
          parentRef: parent?.ref ?? null,
          information: information ?? null,
          tag: null,
        })
        .run();
      return toStructure(db.select().from(nodes).where(eq(nodes.ref, ref)).get()!);
    },

    remove(node) {
      if (!node.ref) return;
      const row = db.select().from(nodes).where(eq(nodes.ref, node.ref)).get();
      if (!row) return;

      // Detach from parent's children (implicit via parentRef)
      removeSubtree(db, node.ref);
    },

    transform(source, target, information) {
      if (!source.ref) throw new Error("Source node has no ref");
      const row = db.select().from(nodes).where(eq(nodes.ref, source.ref)).get();
      if (!row) throw new Error(`Source node not found: ${source.ref}`);

      const targetParent = target.parent;
      if (!targetParent) {
        throw new Error(`Cannot transform to root structure: ${target.name}`);
      }

      const parentRow = db.select().from(nodes).where(eq(nodes.name, targetParent.name)).get();
      if (!parentRow) {
        throw new Error(`No node found for structure: ${targetParent.name}`);
      }

      // Reparent + update type in place — subtree preserved
      db.update(nodes)
        .set({
          parentRef: parentRow.ref,
          name: target.name,
          description: target.description,
          ...(information !== undefined ? { information } : {}),
        })
        .where(eq(nodes.ref, source.ref))
        .run();

      return toStructure(db.select().from(nodes).where(eq(nodes.ref, source.ref)).get()!);
    },

    link(from, to, relationName, reverseName) {
      if (!from.ref) throw new Error("Source node has no ref");
      if (!to.ref) throw new Error("Target node has no ref");

      // Forward: from → to
      const existsForward = db
        .select()
        .from(links)
        .where(
          and(
            eq(links.fromRef, from.ref),
            eq(links.toRef, to.ref),
            eq(links.relation, relationName)
          )
        )
        .get();
      if (!existsForward) {
        db.insert(links).values({ fromRef: from.ref, toRef: to.ref, relation: relationName }).run();
      }

      // Reverse: to → from
      const existsReverse = db
        .select()
        .from(links)
        .where(
          and(eq(links.fromRef, to.ref), eq(links.toRef, from.ref), eq(links.relation, reverseName))
        )
        .get();
      if (!existsReverse) {
        db.insert(links).values({ fromRef: to.ref, toRef: from.ref, relation: reverseName }).run();
      }
    },

    unlink(from, to, relationName, reverseName) {
      if (!from.ref || !to.ref) return;

      db.delete(links)
        .where(
          and(
            eq(links.fromRef, from.ref),
            eq(links.toRef, to.ref),
            eq(links.relation, relationName)
          )
        )
        .run();

      db.delete(links)
        .where(
          and(eq(links.fromRef, to.ref), eq(links.toRef, from.ref), eq(links.relation, reverseName))
        )
        .run();
    },

    tag(node, tagValue) {
      if (!node.ref) throw new Error("Node has no ref");
      const row = db.select().from(nodes).where(eq(nodes.ref, node.ref)).get();
      if (!row) throw new Error(`Node not found: ${node.ref}`);
      db.update(nodes).set({ tag: tagValue }).where(eq(nodes.ref, node.ref)).run();
    },

    project(node) {
      if (!node.ref) throw new Error(`Node has no ref`);
      return projectNode(db, node.ref);
    },

    roots() {
      const rows = db.select().from(nodes).where(isNull(nodes.parentRef)).all();
      return rows.map(toStructure);
    },
  };
}
