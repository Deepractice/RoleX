/**
 * Organization management — hiring, firing, and structuring.
 *
 * hire / fire         — membership (who belongs)
 * appoint / dismiss   — appointment (who holds a position)
 * charter             — define org rules and mission
 * charge              — add duties to a position
 */
import { create, link, process, unlink } from "@rolexjs/system";
import { charter, duty, organization, position } from "./structures.js";

// Membership
export const hire = process(
  "hire",
  "Hire an individual into the organization",
  organization,
  link(organization, "membership")
);
export const fire = process(
  "fire",
  "Fire an individual from the organization",
  organization,
  unlink(organization, "membership")
);

// Appointment
export const appoint = process(
  "appoint",
  "Appoint a member to a position",
  position,
  link(position, "appointment")
);
export const dismiss = process(
  "dismiss",
  "Dismiss from a position",
  position,
  unlink(position, "appointment")
);

// Structure
export const charterOrg = process(
  "charter",
  "Define the charter for an organization",
  organization,
  create(charter)
);
export const charge = process("charge", "Add a duty to a position", position, create(duty));
