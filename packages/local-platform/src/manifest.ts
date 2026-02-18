/**
 * Manifest — file-based storage format for RoleX entities.
 *
 * Storage layout:
 *   role/<id>/
 *     individual.json              — manifest (tree structure + links)
 *     <id>.<type>.feature          — node information (Gherkin)
 *
 *   organization/<id>/
 *     organization.json            — manifest (tree structure + links)
 *     <id>.<type>.feature          — node information (Gherkin)
 *
 * Rules:
 *   - Directories: only role/ and organization/ at top level
 *   - Files: all [id].[type].feature, flat within the entity directory
 *   - Manifest: tree structure in JSON, content in .feature files
 *   - Nodes without explicit id default to their type name
 */

import type { State } from "@rolexjs/system";

// ===== Manifest types =====

/** A node in the manifest tree. */
export interface ManifestNode {
  readonly type: string;
  readonly ref?: string;
  readonly children?: Record<string, ManifestNode>;
}

/** Root manifest for an entity (individual or organization). */
export interface Manifest {
  readonly id: string;
  readonly type: string;
  readonly ref?: string;
  readonly alias?: readonly string[];
  readonly children?: Record<string, ManifestNode>;
  readonly links?: Record<string, string[]>;
}

// ===== State → files =====

export interface FileEntry {
  readonly path: string;
  readonly content: string;
}

/**
 * Convert a State tree to a manifest + feature files.
 * Returns the manifest and a list of file entries (path → content).
 */
export function stateToFiles(state: State): { manifest: Manifest; files: FileEntry[] } {
  const files: FileEntry[] = [];

  const collectFiles = (node: State, nodeId: string) => {
    if (node.information) {
      files.push({
        path: `${nodeId}.${node.name}.feature`,
        content: node.information,
      });
    }
    if (node.children) {
      for (const child of node.children) {
        const childId = child.id ?? child.name;
        collectFiles(child, childId);
      }
    }
  };

  const rootId = state.id ?? state.name;
  collectFiles(state, rootId);

  const buildManifestNode = (node: State): ManifestNode => {
    const entry: ManifestNode = {
      type: node.name,
      ...(node.ref ? { ref: node.ref } : {}),
    };
    if (node.children && node.children.length > 0) {
      const children: Record<string, ManifestNode> = {};
      for (const child of node.children) {
        const childId = child.id ?? child.name;
        children[childId] = buildManifestNode(child);
      }
      return { ...entry, children };
    }
    return entry;
  };

  const manifestNode = buildManifestNode(state);

  const manifest: Manifest = {
    id: rootId,
    type: state.name,
    ...(state.ref ? { ref: state.ref } : {}),
    ...(state.alias ? { alias: state.alias } : {}),
    ...(manifestNode.children ? { children: manifestNode.children } : {}),
    ...(state.links && state.links.length > 0
      ? {
          links: buildManifestLinks(state.links),
        }
      : {}),
  };

  return { manifest, files };
}

function buildManifestLinks(
  links: readonly { readonly relation: string; readonly target: State }[]
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const link of links) {
    const targetId = link.target.id ?? link.target.name;
    if (!result[link.relation]) {
      result[link.relation] = [];
    }
    result[link.relation].push(targetId);
  }
  return result;
}

// ===== Files → State =====

/**
 * Convert a manifest + feature file contents to a State tree.
 * fileContents maps filename (e.g. "role-creation.principle.feature") to Gherkin text.
 */
export function filesToState(
  manifest: Manifest,
  fileContents: Record<string, string>
): State {
  const buildState = (id: string, node: ManifestNode): State => {
    const filename = `${id}.${node.type}.feature`;
    const information = fileContents[filename];

    const children: State[] = [];
    if (node.children) {
      for (const [childId, childNode] of Object.entries(node.children)) {
        children.push(buildState(childId, childNode));
      }
    }

    return {
      ...(node.ref ? { ref: node.ref } : {}),
      id,
      name: node.type,
      description: "",
      parent: null,
      ...(information ? { information } : {}),
      ...(children.length > 0 ? { children } : {}),
    };
  };

  const rootFilename = `${manifest.id}.${manifest.type}.feature`;
  const rootInformation = fileContents[rootFilename];

  const children: State[] = [];
  if (manifest.children) {
    for (const [childId, childNode] of Object.entries(manifest.children)) {
      children.push(buildState(childId, childNode));
    }
  }

  const links: { relation: string; target: State }[] = [];
  if (manifest.links) {
    for (const [relation, targetIds] of Object.entries(manifest.links)) {
      for (const targetId of targetIds) {
        links.push({
          relation,
          target: {
            id: targetId,
            name: "",
            description: "",
            parent: null,
          },
        });
      }
    }
  }

  return {
    ...(manifest.ref ? { ref: manifest.ref } : {}),
    id: manifest.id,
    ...(manifest.alias ? { alias: manifest.alias } : {}),
    name: manifest.type,
    description: "",
    parent: null,
    ...(rootInformation ? { information: rootInformation } : {}),
    ...(children.length > 0 ? { children } : {}),
    ...(links.length > 0 ? { links } : {}),
  };
}
