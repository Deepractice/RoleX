import { def } from "./def.js";

export const orgCharter = def(
  "org",
  "charter",
  {
    org: { type: "string", required: true, description: "Organization id" },
    content: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the charter",
    },
    id: { type: "string", required: true, description: "Charter id" },
  },
  ["org", "content", "id"]
);

export const orgHire = def(
  "org",
  "hire",
  {
    org: { type: "string", required: true, description: "Organization id" },
    individual: { type: "string", required: true, description: "Individual id" },
  },
  ["org", "individual"]
);

export const orgFire = def(
  "org",
  "fire",
  {
    org: { type: "string", required: true, description: "Organization id" },
    individual: { type: "string", required: true, description: "Individual id" },
  },
  ["org", "individual"]
);

export const orgAdmin = def(
  "org",
  "admin",
  {
    org: { type: "string", required: true, description: "Organization id" },
    individual: { type: "string", required: true, description: "Individual id" },
  },
  ["org", "individual"]
);

export const orgUnadmin = def(
  "org",
  "unadmin",
  {
    org: { type: "string", required: true, description: "Organization id" },
    individual: { type: "string", required: true, description: "Individual id" },
  },
  ["org", "individual"]
);
