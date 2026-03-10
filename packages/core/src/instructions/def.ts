import type { ArgEntry, InstructionDef } from "../schema.js";

export function def(
  namespace: string,
  method: string,
  params: InstructionDef["params"],
  args: readonly ArgEntry[]
): InstructionDef {
  return { namespace, method, params, args };
}
