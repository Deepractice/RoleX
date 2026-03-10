import { def } from "./def.js";

export const societyBorn = def(
  "society",
  "born",
  {
    content: {
      type: "gherkin",
      required: false,
      description: "Gherkin Feature source for the individual",
    },
    id: { type: "string", required: true, description: "User-facing identifier (kebab-case)" },
    alias: { type: "string[]", required: false, description: "Alternative names" },
  },
  ["content", "id", "alias"]
);

export const societyRetire = def(
  "society",
  "retire",
  {
    individual: { type: "string", required: true, description: "Individual id" },
  },
  ["individual"]
);

export const societyDie = def(
  "society",
  "die",
  {
    individual: { type: "string", required: true, description: "Individual id" },
  },
  ["individual"]
);

export const societyRehire = def(
  "society",
  "rehire",
  {
    individual: { type: "string", required: true, description: "Individual id (from past)" },
  },
  ["individual"]
);

export const societyTeach = def(
  "society",
  "teach",
  {
    individual: { type: "string", required: true, description: "Individual id" },
    content: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the principle",
    },
    id: {
      type: "string",
      required: true,
      description: "Principle id (keywords joined by hyphens)",
    },
  },
  ["individual", "content", "id"]
);

export const societyTrain = def(
  "society",
  "train",
  {
    individual: { type: "string", required: true, description: "Individual id" },
    content: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the procedure",
    },
    id: {
      type: "string",
      required: true,
      description: "Procedure id (keywords joined by hyphens)",
    },
  },
  ["individual", "content", "id"]
);

export const societyFound = def(
  "society",
  "found",
  {
    content: {
      type: "gherkin",
      required: false,
      description: "Gherkin Feature source for the organization",
    },
    id: { type: "string", required: true, description: "User-facing identifier (kebab-case)" },
    alias: { type: "string[]", required: false, description: "Alternative names" },
    admin: {
      type: "string",
      required: false,
      description: "Individual id of the first admin",
    },
  },
  ["content", "id", "alias", "admin"]
);

export const societyDissolve = def(
  "society",
  "dissolve",
  {
    org: { type: "string", required: true, description: "Organization id" },
  },
  ["org"]
);

export const societyCrown = def(
  "society",
  "crown",
  {
    individual: { type: "string", required: true, description: "Individual id to crown" },
  },
  ["individual"]
);

export const societyUncrown = def(
  "society",
  "uncrown",
  {
    individual: { type: "string", required: true, description: "Individual id to uncrown" },
  },
  ["individual"]
);
