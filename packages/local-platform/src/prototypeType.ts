/**
 * Prototype ResourceX type — resolves a prototype resource into
 * an executable instruction set with all @filename references resolved.
 *
 * Returns: { id: string, instructions: Array<{ op: string, args: Record<string, unknown> }> }
 */

import type { BundledType } from "resourcexjs";

export const prototypeType: BundledType = {
  name: "prototype",
  description: "RoleX prototype — instruction set for materializing roles and organizations",
  code: `// @resolver: prototype_type_default
var prototype_type_default = {
  async resolve(ctx) {
    var protoFile = ctx.files["prototype.json"];
    if (!protoFile) throw new Error("Prototype resource must contain a prototype.json file");

    var decoder = new TextDecoder();
    var instructions = JSON.parse(decoder.decode(protoFile));

    if (!Array.isArray(instructions)) {
      throw new Error("prototype.json must be a JSON array of instructions");
    }

    // Resolve @filename references in instruction args
    var resolved = instructions.map(function(instr) {
      var resolvedArgs = {};
      var keys = Object.keys(instr.args || {});
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = instr.args[key];
        if (typeof value === "string" && value.startsWith("@")) {
          var filename = value.slice(1);
          var file = ctx.files[filename];
          if (!file) throw new Error("Referenced file not found: " + filename);
          resolvedArgs[key] = decoder.decode(file);
        } else {
          resolvedArgs[key] = value;
        }
      }
      return { op: instr.op, args: resolvedArgs };
    });

    return { id: ctx.manifest.name, instructions: resolved };
  }
};`,
};
