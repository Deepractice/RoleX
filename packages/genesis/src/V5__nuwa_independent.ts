import type { Migration } from "@rolexjs/core";

export const V5__nuwa_independent: Migration = {
  version: 5,
  id: "V5__nuwa_independent",
  checksum: "",
  instructions: [
    // Remove Nuwa from rolex org — she is a top-level sovereign individual
    {
      op: "!org.fire",
      args: {
        org: "rolex",
        individual: "nuwa",
      },
    },
    // Dissolve rolex org — no longer needed, Nuwa operates at society level
    {
      op: "!society.dissolve",
      args: {
        org: "rolex",
      },
    },
  ],
};
