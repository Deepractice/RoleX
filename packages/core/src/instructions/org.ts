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

export const orgLaunch = def(
  "org",
  "launch",
  {
    content: {
      type: "gherkin",
      required: false,
      description: "Gherkin Feature source for the project",
    },
    id: { type: "string", required: true, description: "User-facing identifier (kebab-case)" },
    alias: { type: "string[]", required: false, description: "Alternative names" },
    org: {
      type: "string",
      required: false,
      description: "Organization id that owns this project",
    },
    maintainer: {
      type: "string",
      required: false,
      description: "Individual id of the first maintainer",
    },
  },
  ["content", "id", "alias", "org", "maintainer"]
);

export const orgArchive = def(
  "org",
  "archive",
  {
    project: { type: "string", required: true, description: "Project id" },
  },
  ["project"]
);

export const orgEstablish = def(
  "org",
  "establish",
  {
    content: {
      type: "gherkin",
      required: false,
      description: "Gherkin Feature source for the position",
    },
    id: { type: "string", required: true, description: "User-facing identifier (kebab-case)" },
    alias: { type: "string[]", required: false, description: "Alternative names" },
  },
  ["content", "id", "alias"]
);

export const orgAbolish = def(
  "org",
  "abolish",
  {
    position: { type: "string", required: true, description: "Position id" },
  },
  ["position"]
);
