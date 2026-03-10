import { def } from "./def.js";

export const positionEstablish = def(
  "position",
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

export const positionCharge = def(
  "position",
  "charge",
  {
    position: { type: "string", required: true, description: "Position id" },
    content: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the duty",
    },
    id: { type: "string", required: true, description: "Duty id (keywords joined by hyphens)" },
  },
  ["position", "content", "id"]
);

export const positionRequire = def(
  "position",
  "require",
  {
    position: { type: "string", required: true, description: "Position id" },
    content: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the skill requirement",
    },
    id: {
      type: "string",
      required: true,
      description: "Requirement id (keywords joined by hyphens)",
    },
  },
  ["position", "content", "id"]
);

export const positionAbolish = def(
  "position",
  "abolish",
  {
    position: { type: "string", required: true, description: "Position id" },
  },
  ["position"]
);

export const positionAppoint = def(
  "position",
  "appoint",
  {
    position: { type: "string", required: true, description: "Position id" },
    individual: { type: "string", required: true, description: "Individual id" },
  },
  ["position", "individual"]
);

export const positionDismiss = def(
  "position",
  "dismiss",
  {
    position: { type: "string", required: true, description: "Position id" },
    individual: { type: "string", required: true, description: "Individual id" },
  },
  ["position", "individual"]
);
