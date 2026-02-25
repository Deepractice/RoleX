/**
 * ResourceX type handler for prototype resources.
 *
 * A prototype resource contains:
 *   - prototype.json  (instruction list: { op, args })
 *   - *.feature       (Gherkin content)
 *
 * The resolver reads prototype.json, and for each args value prefixed with @,
 * replaces it with the actual file content. Returns self-contained instructions.
 */
import type { BundledType } from "resourcexjs";

export const prototypeType: BundledType = {
  name: "prototype",
  aliases: ["role", "individual", "organization", "org"],
  description: "RoleX prototype — instruction list + feature files",
  code: `// @resolver: prototype_type_default
var prototype_type_default = {
  name: "prototype",
  async resolve(ctx) {
    var decoder = new TextDecoder();

    // Read and parse prototype.json
    var protoBuf = ctx.files["prototype.json"];
    if (!protoBuf) {
      throw new Error("prototype resource must contain a prototype.json file");
    }
    var instructions = JSON.parse(decoder.decode(protoBuf));

    // Collect .feature file contents
    var features = {};
    for (var name of Object.keys(ctx.files)) {
      if (name.endsWith(".feature")) {
        features[name] = decoder.decode(ctx.files[name]);
      }
    }

    // Resolve @ references in args: "@filename" → file content
    for (var i = 0; i < instructions.length; i++) {
      var instr = instructions[i];
      if (instr.args) {
        var newArgs = {};
        var keys = Object.keys(instr.args);
        for (var j = 0; j < keys.length; j++) {
          var key = keys[j];
          var val = instr.args[key];
          if (typeof val === "string" && val.charAt(0) === "@") {
            var filename = val.slice(1);
            newArgs[key] = features[filename] || val;
          } else {
            newArgs[key] = val;
          }
        }
        instructions[i] = { op: instr.op, args: newArgs };
      }
    }

    return instructions;
  }
};`,
};
