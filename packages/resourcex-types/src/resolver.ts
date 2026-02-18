/**
 * Shared resolver logic for role and organization types.
 *
 * This code is inlined as a string in BundledType.code.
 * It parses manifest JSON + .feature files into a State tree.
 *
 * The resolver receives ctx.files (Record<string, Buffer>) and
 * returns a State object (plain JS object).
 */

/**
 * Generate the resolver code string for a given manifest filename.
 * The code is self-contained — no imports, runs in ResourceX's sandbox.
 */
export function resolverCode(typeName: string, manifestFile: string): string {
  return `// @resolver: ${typeName}_type_default
var ${typeName}_type_default = {
  name: "${typeName}",
  async resolve(ctx) {
    var decoder = new TextDecoder();

    // Find and parse manifest
    var manifestBuf = ctx.files["${manifestFile}"];
    if (!manifestBuf) {
      throw new Error("${typeName} resource must contain a ${manifestFile} file");
    }
    var manifest = JSON.parse(decoder.decode(manifestBuf));

    // Collect .feature file contents
    var features = {};
    for (var name of Object.keys(ctx.files)) {
      if (name.endsWith(".feature")) {
        features[name] = decoder.decode(ctx.files[name]);
      }
    }

    // Build State tree from manifest node
    function buildState(id, node) {
      var filename = id + "." + node.type + ".feature";
      var information = features[filename];
      var children = [];
      if (node.children) {
        var entries = Object.entries(node.children);
        for (var i = 0; i < entries.length; i++) {
          children.push(buildState(entries[i][0], entries[i][1]));
        }
      }
      var state = { id: id, name: node.type, description: "", parent: null };
      if (information) state.information = information;
      if (children.length > 0) state.children = children;
      return state;
    }

    // Build root State
    var rootFilename = manifest.id + "." + manifest.type + ".feature";
    var rootInformation = features[rootFilename];
    var children = [];
    if (manifest.children) {
      var entries = Object.entries(manifest.children);
      for (var i = 0; i < entries.length; i++) {
        children.push(buildState(entries[i][0], entries[i][1]));
      }
    }

    var state = { id: manifest.id, name: manifest.type, description: "", parent: null };
    if (manifest.alias) state.alias = manifest.alias;
    if (rootInformation) state.information = rootInformation;
    if (children.length > 0) state.children = children;
    return state;
  }
};`;
}
