/**
 * RoleX Error Classes
 * @rolexjs/core
 */

/**
 * Base error class for all RoleX errors
 */
export class RoleXError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "RoleXError";
  }
}

/**
 * Error thrown when role loading fails
 */
export class RoleLoadError extends RoleXError {
  constructor(
    message: string,
    public readonly locator?: string
  ) {
    super(message);
    this.name = "RoleLoadError";
  }
}

/**
 * Error thrown when resource resolution fails
 */
export class ResourceResolveError extends RoleXError {
  constructor(
    message: string,
    public readonly src?: string
  ) {
    super(message);
    this.name = "ResourceResolveError";
  }
}

/**
 * Error thrown when DPML parsing fails
 */
export class DPMLParseError extends RoleXError {
  constructor(message: string) {
    super(message);
    this.name = "DPMLParseError";
  }
}
