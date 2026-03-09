/**
 * PermissionRegistry — maps relation names to permissions.
 *
 * Permissions are defined in code, not stored in the database.
 * After projection, the registry enriches links with their permissions.
 */

import type { Permission, State } from "@rolexjs/system";

export class PermissionRegistry {
  private readonly map = new Map<string, readonly Permission[]>();

  register(relation: string, permissions: readonly Permission[]): this {
    this.map.set(relation, permissions);
    return this;
  }

  /** Enrich a projected state tree — attach permissions to links by relation name. */
  enrich(state: State): State {
    return this.walk(state);
  }

  private walk(s: State): State {
    const children = s.children?.map((c) => this.walk(c));
    const enrichedLinks = s.links?.map((l) => {
      const permissions = this.map.get(l.relation);
      if (permissions && permissions.length > 0) {
        return { ...l, permissions };
      }
      return l;
    });

    return {
      ...s,
      ...(children ? { children } : {}),
      ...(enrichedLinks ? { links: enrichedLinks } : {}),
    };
  }
}
