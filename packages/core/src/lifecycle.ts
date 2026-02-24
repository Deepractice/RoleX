/**
 * Lifecycle — creation, retirement, and dissolution.
 *
 * born / found / establish   — bring things into existence
 * retire / die               — individual → past
 * dissolve                   — organization → past
 * abolish                    — position → past
 * rehire                     — past → individual (return from retirement)
 *
 * No real deletion — everything transforms to the "past" branch.
 */
import { create, process, transform } from "@rolexjs/system";
import { individual, organization, past, position, society } from "./structures.js";

// Creation
export const born = process(
  "born",
  "An individual is born into society",
  society,
  create(individual)
);
export const found = process("found", "Found an organization", society, create(organization));
export const establish = process("establish", "Establish a position", society, create(position));

// Retirement & death
export const retire = process(
  "retire",
  "Retire an individual",
  individual,
  transform(individual, past)
);
export const die = process("die", "An individual dies", individual, transform(individual, past));

// Dissolution
export const dissolve = process(
  "dissolve",
  "Dissolve an organization",
  organization,
  transform(organization, past)
);
export const abolish = process(
  "abolish",
  "Abolish a position",
  position,
  transform(position, past)
);

// Return
export const rehire = process(
  "rehire",
  "Rehire a retired individual",
  past,
  transform(past, individual)
);
