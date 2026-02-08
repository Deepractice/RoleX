/**
 * @rolexjs/local-platform
 *
 * Local filesystem implementation of Platform.
 * Stores roles in .rolex/ directories.
 *
 * On first use, bootstraps from the bundled seed .rolex/ —
 * including 女娲 (the genesis role).
 */

export { LocalPlatform } from "./LocalPlatform.js";
