/**
 * Identity — The role's complete self.
 *
 * NOT a Feature itself — it is a container that wraps
 * multiple Features (*.identity.feature files).
 * Always loaded, independent of any goal.
 */

import type { Feature } from "./Feature.js";

/**
 * The identity foundation of a role. Wraps many Features.
 */
export interface Identity {
  readonly features: Feature[];
}
