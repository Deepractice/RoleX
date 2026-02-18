/**
 * mergeState — union merge two State trees.
 *
 * Prototype mechanism: merge a base (prototype) with an overlay (instance).
 * Children are unioned, not overwritten. Links are unioned and deduplicated.
 *
 * Matching rules for children:
 *   - Same name + same id (both defined)  → recursive merge
 *   - Same name + both no id + one each   → recursive merge (structural singleton)
 *   - Everything else                     → include from both sides
 */
import type { State } from "./process.js";

export const mergeState = (base: State, overlay: State): State => {
  const mergedChildren = mergeChildren(base.children, overlay.children);
  const mergedLinks = mergeLinks(base.links, overlay.links);

  return {
    ...base,
    // overlay scalar properties take precedence when present
    ...(overlay.ref ? { ref: overlay.ref } : {}),
    ...(overlay.id ? { id: overlay.id } : {}),
    ...(overlay.information ? { information: overlay.information } : {}),
    ...(overlay.alias ? { alias: overlay.alias } : {}),
    ...(mergedChildren ? { children: mergedChildren } : {}),
    ...(mergedLinks ? { links: mergedLinks } : {}),
  };
};

const mergeChildren = (
  baseChildren?: readonly State[],
  overlayChildren?: readonly State[]
): readonly State[] | undefined => {
  if (!baseChildren && !overlayChildren) return undefined;
  if (!baseChildren) return overlayChildren;
  if (!overlayChildren) return baseChildren;

  const result: State[] = [];

  // Group children by name
  const baseByName = groupByName(baseChildren);
  const overlayByName = groupByName(overlayChildren);
  const allNames = new Set([...baseByName.keys(), ...overlayByName.keys()]);

  for (const name of allNames) {
    const baseGroup = baseByName.get(name) ?? [];
    const overlayGroup = overlayByName.get(name) ?? [];

    if (baseGroup.length === 0) {
      result.push(...overlayGroup);
      continue;
    }
    if (overlayGroup.length === 0) {
      result.push(...baseGroup);
      continue;
    }

    // Match by id
    const matchedOverlay = new Set<number>();
    const unmatchedBase: State[] = [];

    for (const b of baseGroup) {
      if (b.id) {
        const oIdx = overlayGroup.findIndex(
          (o, i) => !matchedOverlay.has(i) && o.id === b.id
        );
        if (oIdx >= 0) {
          result.push(mergeState(b, overlayGroup[oIdx]));
          matchedOverlay.add(oIdx);
        } else {
          unmatchedBase.push(b);
        }
      } else {
        unmatchedBase.push(b);
      }
    }

    const unmatchedOverlay = overlayGroup.filter((_, i) => !matchedOverlay.has(i));

    // Singleton merge: same name, no id, exactly one on each side
    const noIdBase = unmatchedBase.filter((s) => !s.id);
    const hasIdBase = unmatchedBase.filter((s) => s.id);
    const noIdOverlay = unmatchedOverlay.filter((s) => !s.id);
    const hasIdOverlay = unmatchedOverlay.filter((s) => s.id);

    if (noIdBase.length === 1 && noIdOverlay.length === 1) {
      result.push(mergeState(noIdBase[0], noIdOverlay[0]));
    } else {
      result.push(...noIdBase, ...noIdOverlay);
    }

    result.push(...hasIdBase, ...hasIdOverlay);
  }

  return result;
};

const mergeLinks = (
  baseLinks?: State["links"],
  overlayLinks?: State["links"]
): State["links"] | undefined => {
  if (!baseLinks && !overlayLinks) return undefined;
  if (!baseLinks) return overlayLinks;
  if (!overlayLinks) return baseLinks;

  const seen = new Set<string>();
  const result: { readonly relation: string; readonly target: State }[] = [];

  for (const link of [...baseLinks, ...overlayLinks]) {
    const key = `${link.relation}:${link.target.id ?? link.target.ref ?? link.target.name}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(link);
    }
  }

  return result;
};

const groupByName = (states: readonly State[]): Map<string, State[]> => {
  const map = new Map<string, State[]>();
  for (const s of states) {
    const group = map.get(s.name);
    if (group) {
      group.push(s);
    } else {
      map.set(s.name, [s]);
    }
  }
  return map;
};
