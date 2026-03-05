/**
 * applyPrototype — apply a prototype's migrations incrementally.
 *
 * Pure function: receives data + storage + executor, no framework coupling.
 * Checks migration history, executes only unapplied migrations, records each.
 */

import type { PrototypeData, PrototypeRepository } from "@rolexjs/core";

/** Result of applying a prototype. */
export interface ApplyResult {
  prototypeId: string;
  applied: number;
  skipped: number;
  upToDate: boolean;
}

/**
 * Apply a prototype — execute unapplied migrations in version order.
 *
 * @param data - The prototype data structure with migrations
 * @param repo - Storage layer for migration history
 * @param direct - Executor for prototype instructions
 */
export async function applyPrototype(
  data: PrototypeData,
  repo: PrototypeRepository,
  direct: (op: string, args: Record<string, unknown>) => Promise<unknown>
): Promise<ApplyResult> {
  const sorted = [...data.migrations].sort((a, b) => a.version - b.version);
  let applied = 0;
  let skipped = 0;

  for (const migration of sorted) {
    if (await repo.hasMigration(data.id, migration.id)) {
      skipped++;
      continue;
    }

    for (const instr of migration.instructions) {
      await direct(instr.op, instr.args);
    }
    await repo.recordMigration(data.id, migration.id, migration.version, migration.checksum);
    applied++;
  }

  await repo.settle(data.id, data.source);

  return {
    prototypeId: data.id,
    applied,
    skipped,
    upToDate: applied === 0,
  };
}
