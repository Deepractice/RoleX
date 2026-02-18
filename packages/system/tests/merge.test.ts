import { describe, expect, test } from "bun:test";
import type { State } from "../src/index.js";
import { mergeState } from "../src/merge.js";

// Helper to create minimal State nodes
const state = (
  name: string,
  opts?: { id?: string; ref?: string; information?: string; children?: State[]; links?: State["links"] }
): State => ({
  name,
  description: "",
  parent: null,
  ...(opts?.ref ? { ref: opts.ref } : {}),
  ...(opts?.id ? { id: opts.id } : {}),
  ...(opts?.information ? { information: opts.information } : {}),
  ...(opts?.children ? { children: opts.children } : {}),
  ...(opts?.links ? { links: opts.links } : {}),
});

describe("mergeState", () => {
  test("merge two empty nodes returns merged node", () => {
    const base = state("individual");
    const overlay = state("individual");
    const result = mergeState(base, overlay);
    expect(result.name).toBe("individual");
    expect(result.children).toBeUndefined();
  });

  test("base-only children are preserved", () => {
    const base = state("individual", {
      children: [state("identity", { information: "Feature: I am Nuwa" })],
    });
    const overlay = state("individual");
    const result = mergeState(base, overlay);
    expect(result.children).toHaveLength(1);
    expect(result.children![0].name).toBe("identity");
    expect(result.children![0].information).toBe("Feature: I am Nuwa");
  });

  test("overlay-only children are preserved", () => {
    const base = state("individual");
    const overlay = state("individual", {
      children: [state("encounter", { information: "Feature: Did something" })],
    });
    const result = mergeState(base, overlay);
    expect(result.children).toHaveLength(1);
    expect(result.children![0].name).toBe("encounter");
  });

  test("different-name children are unioned", () => {
    const base = state("individual", {
      children: [state("identity")],
    });
    const overlay = state("individual", {
      children: [state("encounter")],
    });
    const result = mergeState(base, overlay);
    expect(result.children).toHaveLength(2);
    const names = result.children!.map((c) => c.name);
    expect(names).toContain("identity");
    expect(names).toContain("encounter");
  });

  test("same-name same-id children are recursively merged", () => {
    const base = state("knowledge", {
      children: [
        state("principle", { id: "naming", information: "Feature: Name params well" }),
      ],
    });
    const overlay = state("knowledge", {
      children: [
        state("principle", {
          id: "naming",
          information: "Feature: Name params well",
          children: [state("note", { information: "extra detail" })],
        }),
      ],
    });
    const result = mergeState(base, overlay);
    expect(result.children).toHaveLength(1);
    expect(result.children![0].id).toBe("naming");
    // overlay's children should appear via recursive merge
    expect(result.children![0].children).toHaveLength(1);
  });

  test("same-name different-id children are both kept", () => {
    const base = state("knowledge", {
      children: [state("principle", { id: "naming", information: "A" })],
    });
    const overlay = state("knowledge", {
      children: [state("principle", { id: "platform-seam", information: "B" })],
    });
    const result = mergeState(base, overlay);
    expect(result.children).toHaveLength(2);
    const ids = result.children!.map((c) => c.id);
    expect(ids).toContain("naming");
    expect(ids).toContain("platform-seam");
  });

  test("singleton merge: same-name no-id one each are recursively merged", () => {
    const base = state("individual", {
      children: [
        state("identity", {
          children: [state("background", { information: "base bg" })],
        }),
      ],
    });
    const overlay = state("individual", {
      children: [
        state("identity", {
          children: [state("tone", { information: "overlay tone" })],
        }),
      ],
    });
    const result = mergeState(base, overlay);
    expect(result.children).toHaveLength(1);
    expect(result.children![0].name).toBe("identity");
    // identity's children should be merged: background + tone
    expect(result.children![0].children).toHaveLength(2);
    const names = result.children![0].children!.map((c) => c.name);
    expect(names).toContain("background");
    expect(names).toContain("tone");
  });

  test("multiple no-id same-name: all kept without merging", () => {
    const base = state("individual", {
      children: [
        state("encounter", { information: "Event A" }),
        state("encounter", { information: "Event B" }),
      ],
    });
    const overlay = state("individual", {
      children: [state("encounter", { information: "Event C" })],
    });
    const result = mergeState(base, overlay);
    // base has 2 encounters (no id), overlay has 1 (no id) — cannot match singletons
    // all 3 should be preserved
    expect(result.children).toHaveLength(3);
  });

  test("deep recursive merge across three levels", () => {
    const base = state("individual", {
      children: [
        state("knowledge", {
          children: [
            state("principle", { id: "a", information: "Principle A" }),
            state("procedure", { id: "x", information: "Procedure X" }),
          ],
        }),
      ],
    });
    const overlay = state("individual", {
      children: [
        state("knowledge", {
          children: [
            state("principle", { id: "b", information: "Principle B" }),
          ],
        }),
      ],
    });
    const result = mergeState(base, overlay);
    const knowledge = result.children![0];
    expect(knowledge.name).toBe("knowledge");
    expect(knowledge.children).toHaveLength(3);
    const items = knowledge.children!.map((c) => `${c.name}:${c.id}`);
    expect(items).toContain("principle:a");
    expect(items).toContain("principle:b");
    expect(items).toContain("procedure:x");
  });

  test("links are unioned", () => {
    const target1 = state("organization", { id: "dp" });
    const target2 = state("organization", { id: "acme" });
    const base = state("individual", {
      links: [{ relation: "belong", target: target1 }],
    });
    const overlay = state("individual", {
      links: [{ relation: "belong", target: target2 }],
    });
    const result = mergeState(base, overlay);
    expect(result.links).toHaveLength(2);
  });

  test("duplicate links are deduplicated", () => {
    const target = state("organization", { id: "dp", information: "DP" });
    const base = state("individual", {
      links: [{ relation: "belong", target }],
    });
    const overlay = state("individual", {
      links: [{ relation: "belong", target }],
    });
    const result = mergeState(base, overlay);
    expect(result.links).toHaveLength(1);
  });

  test("overlay information wins when both present", () => {
    const base = state("individual", { information: "base info" });
    const overlay = state("individual", { information: "overlay info" });
    const result = mergeState(base, overlay);
    expect(result.information).toBe("overlay info");
  });

  test("base information preserved when overlay has none", () => {
    const base = state("individual", { information: "base info" });
    const overlay = state("individual");
    const result = mergeState(base, overlay);
    expect(result.information).toBe("base info");
  });

  test("overlay ref wins when both present", () => {
    const base = state("individual", { ref: "proto-1" });
    const overlay = state("individual", { ref: "n2" });
    const result = mergeState(base, overlay);
    expect(result.ref).toBe("n2");
  });

  test("base ref preserved when overlay has none", () => {
    const base = state("individual", { ref: "proto-1" });
    const overlay = state("individual");
    const result = mergeState(base, overlay);
    expect(result.ref).toBe("proto-1");
  });

  test("overlay ref preserved when base has none (prototype scenario)", () => {
    const base = state("individual");  // prototype, no ref
    const overlay = state("individual", { ref: "n2" });  // runtime instance
    const result = mergeState(base, overlay);
    expect(result.ref).toBe("n2");
  });

  test("ref preserved recursively in singleton merge", () => {
    const base = state("individual", {
      children: [state("knowledge", { information: "proto knowledge" })],
    });
    const overlay = state("individual", {
      ref: "n2",
      children: [state("knowledge", { ref: "n4" })],
    });
    const result = mergeState(base, overlay);
    expect(result.ref).toBe("n2");
    expect(result.children![0].ref).toBe("n4");
    expect(result.children![0].information).toBe("proto knowledge");
  });

  test("pure function: inputs are not modified", () => {
    const baseChild = state("identity", { information: "original" });
    const base = state("individual", { children: [baseChild] });
    const overlay = state("individual", {
      children: [state("encounter")],
    });
    const result = mergeState(base, overlay);
    // base should still have only 1 child
    expect(base.children).toHaveLength(1);
    expect(result.children).toHaveLength(2);
  });
});
