import { def } from "./def.js";

export const productStrategy = def(
  "product",
  "strategy",
  {
    product: { type: "string", required: true, description: "Product id" },
    content: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the strategy",
    },
    id: { type: "string", required: true, description: "Strategy id" },
  },
  ["product", "content", "id"]
);

export const productSpec = def(
  "product",
  "spec",
  {
    product: { type: "string", required: true, description: "Product id" },
    content: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the behavior contract (BDD specification)",
    },
    id: {
      type: "string",
      required: true,
      description: "Spec id (keywords joined by hyphens)",
    },
  },
  ["product", "content", "id"]
);

export const productRelease = def(
  "product",
  "release",
  {
    product: { type: "string", required: true, description: "Product id" },
    content: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the release",
    },
    id: {
      type: "string",
      required: true,
      description: "Release id (e.g. v1.0.0)",
    },
  },
  ["product", "content", "id"]
);

export const productChannel = def(
  "product",
  "channel",
  {
    product: { type: "string", required: true, description: "Product id" },
    content: {
      type: "gherkin",
      required: true,
      description: "Gherkin Feature source for the distribution channel",
    },
    id: {
      type: "string",
      required: true,
      description: "Channel id (e.g. npm, cloud-platform)",
    },
  },
  ["product", "content", "id"]
);

export const productOwn = def(
  "product",
  "own",
  {
    product: { type: "string", required: true, description: "Product id" },
    individual: { type: "string", required: true, description: "Individual id (owner)" },
  },
  ["product", "individual"]
);

export const productDisown = def(
  "product",
  "disown",
  {
    product: { type: "string", required: true, description: "Product id" },
    individual: { type: "string", required: true, description: "Individual id (owner to remove)" },
  },
  ["product", "individual"]
);

export const productDeprecate = def(
  "product",
  "deprecate",
  {
    product: { type: "string", required: true, description: "Product id" },
  },
  ["product"]
);
