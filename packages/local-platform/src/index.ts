/**
 * @rolexjs/local-platform
 *
 * Local platform implementation for RoleX.
 * Map-based runtime with file-based persistence (manifest + .feature files).
 */

export type { LocalPlatformConfig } from "./LocalPlatform.js";
export { localPlatform } from "./LocalPlatform.js";

export type { FileEntry, Manifest, ManifestNode } from "./manifest.js";
export { filesToState, stateToFiles } from "./manifest.js";
