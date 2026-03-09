/**
 * Product management — strategy, specs, releases, channels, ownership.
 *
 * own / disown        — ownership (who is responsible)
 * strategy            — define product strategy
 * spec                — add behavior contract (BDD specification)
 * release             — add version release
 * channel             — add distribution channel
 */
import { create, link, process, unlink } from "@rolexjs/system";
import { channel, product, release, spec, strategy } from "./structures.js";

// Ownership
export const ownProduct = process(
  "own",
  "Assign an owner to the product",
  product,
  link(product, "ownership")
);
export const disownProduct = process(
  "disown",
  "Remove an owner from the product",
  product,
  unlink(product, "ownership")
);

// Structure
export const strategyProduct = process(
  "strategy",
  "Define the strategy for a product",
  product,
  create(strategy)
);
export const specProduct = process(
  "spec",
  "Add a behavior contract to a product",
  product,
  create(spec)
);
export const releaseProduct = process(
  "release",
  "Add a version release to a product",
  product,
  create(release)
);
export const channelProduct = process(
  "channel",
  "Add a distribution channel to a product",
  product,
  create(channel)
);
