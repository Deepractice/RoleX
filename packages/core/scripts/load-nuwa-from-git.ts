#!/usr/bin/env bun
/**
 * Load Nuwa role from GitRegistry
 * Test GitRegistry integration with role loading
 */

import { createRegistry } from "resourcexjs";
import { roleType } from "../dist/index.js";

async function main() {
  console.log("🌟 Loading Nuwa from GitRegistry...\n");

  // 1. Create GitRegistry
  console.log("📡 Creating GitRegistry for deepractice.dev...");
  const gitRegistry = createRegistry({
    type: "git",
    url: "https://github.com/Deepractice/Registry.git",
    domain: "deepractice.dev",
  });

  // 2. Register role type
  gitRegistry.supportType(roleType);

  // 3. Resolve nuwa role
  console.log("🔍 Resolving deepractice.dev/nuwa.role@1.0.0...\n");
  const resolved = await gitRegistry.resolve("deepractice.dev/nuwa.role@1.0.0");

  // 4. Execute to get RenderedRole
  console.log("⚙️  Executing role...\n");
  const role = await resolved.execute();

  // 5. Display results
  console.log("✅ Nuwa loaded successfully!\n");
  console.log("=".repeat(80));
  console.log("\n【Personality】(first 800 chars)");
  console.log("-".repeat(80));
  console.log(`${role.personality.substring(0, 800)}...\n`);

  console.log("【Principle】(first 500 chars)");
  console.log("-".repeat(80));
  console.log(`${role.principle.substring(0, 500)}...\n`);

  console.log("【Knowledge】(first 500 chars)");
  console.log("-".repeat(80));
  console.log(`${role.knowledge.substring(0, 500)}...\n`);

  console.log("【Statistics】");
  console.log("-".repeat(80));
  console.log(`Personality: ${role.personality.length} chars`);
  console.log(`Principle: ${role.principle.length} chars`);
  console.log(`Knowledge: ${role.knowledge.length} chars`);
  console.log(`Full Prompt: ${role.prompt.length} chars`);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
