/**
 * PrototypeInstruction — a single command in a prototype instruction list.
 *
 * Each instruction maps directly to a rolex.use(op, args) call.
 * The `op` field is a RoleX command (e.g. "!individual.born", "!org.found").
 * The `args` field holds command parameters passed to rolex.use.
 *
 * In prototype.json, file references use @ prefix (e.g. "@nuwa.individual.feature").
 * The resolver replaces @ references with actual file content before returning.
 */
export interface PrototypeInstruction {
  /** RoleX command, e.g. "!individual.born", "!org.found". */
  readonly op: string;
  /** Command parameters — passed directly to rolex.use(op, args). */
  readonly args?: Record<string, unknown>;
}
