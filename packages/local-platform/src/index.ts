/**
 * @rolexjs/local-platform
 *
 * Local platform implementation for RoleX.
 * SQLite-backed repository with optional ResourceX integration.
 */

export type { LocalPlatformConfig } from "./LocalPlatform.js";
export { localPlatform } from "./LocalPlatform.js";
export type { FileEntry, Manifest, ManifestNode } from "./manifest.js";
export { filesToState, stateToFiles } from "./manifest.js";
export { SqliteRepository } from "./SqliteRepository.js";
