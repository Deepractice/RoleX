import type { Migration } from "@rolexjs/core";

export const V3__crown_and_cleanup: Migration = {
  version: 3,
  id: "V3__crown_and_cleanup",
  checksum: "",
  instructions: [
    // Crown Nuwa — grant sovereign permissions via society link
    {
      op: "!society.crown",
      args: {
        individual: "nuwa",
      },
    },

    // Dismiss Nuwa from old manager positions before abolishing them
    {
      op: "!position.dismiss",
      args: {
        position: "individual-manager",
        individual: "nuwa",
      },
    },
    {
      op: "!position.dismiss",
      args: {
        position: "organization-manager",
        individual: "nuwa",
      },
    },
    {
      op: "!position.dismiss",
      args: {
        position: "position-manager",
        individual: "nuwa",
      },
    },
    {
      op: "!position.dismiss",
      args: {
        position: "project-manager",
        individual: "nuwa",
      },
    },

    // Abolish old manager positions — replaced by permission system
    {
      op: "!position.abolish",
      args: {
        position: "individual-manager",
      },
    },
    {
      op: "!position.abolish",
      args: {
        position: "organization-manager",
      },
    },
    {
      op: "!position.abolish",
      args: {
        position: "position-manager",
      },
    },
    {
      op: "!position.abolish",
      args: {
        position: "project-manager",
      },
    },
  ],
};
