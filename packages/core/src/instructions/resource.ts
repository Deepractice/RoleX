import { def } from "./def.js";

export const resourceAdd = def(
  "resource",
  "add",
  {
    path: { type: "string", required: true, description: "Path to resource directory" },
  },
  ["path"]
);

export const resourceSearch = def(
  "resource",
  "search",
  {
    query: { type: "string", required: false, description: "Search query" },
  },
  ["query"]
);

export const resourceHas = def(
  "resource",
  "has",
  {
    locator: { type: "string", required: true, description: "Resource locator" },
  },
  ["locator"]
);

export const resourceInfo = def(
  "resource",
  "info",
  {
    locator: { type: "string", required: true, description: "Resource locator" },
  },
  ["locator"]
);

export const resourceRemove = def(
  "resource",
  "remove",
  {
    locator: { type: "string", required: true, description: "Resource locator" },
  },
  ["locator"]
);

export const resourcePush = def(
  "resource",
  "push",
  {
    locator: { type: "string", required: true, description: "Resource locator" },
    registry: { type: "string", required: false, description: "Registry URL (overrides default)" },
  },
  ["locator", { pack: ["registry"] }]
);

export const resourcePull = def(
  "resource",
  "pull",
  {
    locator: { type: "string", required: true, description: "Resource locator" },
    registry: { type: "string", required: false, description: "Registry URL (overrides default)" },
  },
  ["locator", { pack: ["registry"] }]
);

export const resourceClearCache = def(
  "resource",
  "clearCache",
  {
    registry: { type: "string", required: false, description: "Registry to clear cache for" },
  },
  ["registry"]
);
