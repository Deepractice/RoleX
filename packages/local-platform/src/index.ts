/**
 * @rolexjs/local-platform
 *
 * Local platform implementation for RoleX.
 * Map-based runtime with file-based persistence (manifest + .feature files).
 */

export type { LocalPlatformConfig } from "./LocalPlatform.js";
export { localPlatform } from "./LocalPlatform.js";

export type { Manifest, ManifestNode, FileEntry } from "./manifest.js";
export { stateToFiles, filesToState } from "./manifest.js";
