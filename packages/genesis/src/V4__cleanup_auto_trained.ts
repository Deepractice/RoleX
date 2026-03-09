import type { Migration } from "@rolexjs/core";

export const V4__cleanup_auto_trained: Migration = {
  version: 4,
  id: "V4__cleanup_auto_trained",
  checksum: "",
  instructions: [
    // Remove auto-trained procedures from old manager positions — now covered by permissions
    {
      op: "!role.forget",
      args: {
        id: "individual-management",
        individual: "nuwa",
      },
    },
    {
      op: "!role.forget",
      args: {
        id: "organization-management",
        individual: "nuwa",
      },
    },
    {
      op: "!role.forget",
      args: {
        id: "position-management",
        individual: "nuwa",
      },
    },
  ],
};
