#!/usr/bin/env bun
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createRegistry, createRXM, createRXC, parseRXL } from "resourcexjs";
import { createRoleType } from "../dist/index.js";

async function readDirRecursive(dir: string, baseDir: string = dir): Promise<Map<string, string>> {
  const files = new Map<string, string>();
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await readDirRecursive(fullPath, baseDir);
      for (const [path, content] of subFiles) {
        files.set(path, content);
      }
    } else {
      const relativePath = fullPath.replace(baseDir + "/", "");
      const content = await readFile(fullPath, "utf-8");
      files.set(relativePath, content);
    }
  }
  return files;
}

const roleFiles = await readDirRecursive(resolve(import.meta.dir, "../../rolexjs/roles/nuwa"));
console.log(`📄 Found ${roleFiles.size} files`);

const rxl = parseRXL("deepractice.dev/nuwa.role@1.0.0");
const manifest = createRXM({
  domain: "deepractice.dev",
  name: "nuwa",
  type: "role",
  version: "1.0.0",
});

const filesObject: Record<string, string> = {};
for (const [path, content] of roleFiles) {
  filesObject[path] = content;
}
const rxc = await createRXC(filesObject);
const rxr = { locator: rxl, manifest, content: rxc };

const registryPath = "/tmp/Registry/.resourcex";
const tempRegistry = createRegistry({ path: registryPath });
const roleType = createRoleType(tempRegistry);
const registry = createRegistry({
  path: registryPath,
  types: [roleType],
});

console.log("🔗 Linking to Registry...");
await registry.link(rxr);
console.log("✅ Nuwa published!");
console.log(`📍 ${registryPath}/deepractice.dev/nuwa.role/1.0.0/`);
