/**
 * Platform — storage for the three storable concepts.
 *
 * Of the six system concepts:
 *   Structure, Information, Relation → stored (Platform)
 *   State, Process, System → computed (runtime)
 *
 * In RoleX, all information is Gherkin Feature.
 * Platform is parameterized by Information type so the
 * meta-model stays independent of Gherkin specifics.
 */

export interface Platform<I = unknown> {
  // ===== Structure =====

  createStructure(name: string, parent?: string): void;
  removeStructure(name: string): void;
  listStructures(parent?: string): string[];
  hasStructure(name: string, parent?: string): boolean;

  // ===== Information =====

  writeInformation(structure: string, type: string, name: string, content: I): I;
  readInformation(structure: string, type: string, name: string): I | null;
  listInformation(structure: string, type: string): I[];
  removeInformation(structure: string, type: string, name: string): void;

  // ===== Relation (all many-to-many, Process enforces cardinality) =====

  addRelation(name: string, from: string, to: string): void;
  listRelations(name: string, from: string): string[];
  hasRelation(name: string, from: string, to: string): boolean;
  removeRelation(name: string, from: string, to: string): void;

  // ===== File (arbitrary file read, optional) =====

  readFile?(path: string): string | null;

  // ===== Settings (global key-value, optional) =====

  readSettings?(): Record<string, unknown>;
  writeSettings?(settings: Record<string, unknown>): void;
}
