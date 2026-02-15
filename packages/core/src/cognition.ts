/**
 * Cognition cycle — the learning loop.
 *
 * encounter → reflect → experience → realize → principle
 *                                   → master  → skill
 *
 * Encounters are raw events (produced by the execution cycle).
 * Reflection distills them into experience. From experience,
 * principles are realized and skills are mastered.
 */
import { process, transform } from "@rolexjs/system";
import { encounter, experience, principle, skill } from "./structures.js";

export const reflect = process(
  "reflect",
  "Reflect on encounters, distill into experience",
  encounter,
  transform(encounter, experience)
);
export const realize = process(
  "realize",
  "Realize a principle from experience",
  experience,
  transform(experience, principle)
);
export const master = process(
  "master",
  "Master a skill from experience",
  experience,
  transform(experience, skill)
);
