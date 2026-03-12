/**
 * Unified BDD World — test context for all RoleX BDD tests.
 *
 * Combines three layers:
 *   - MCP (dev): local source via `bun run src/index.ts`
 *   - MCP (npx): published package via `npx @rolexjs/mcp-server`
 *   - Rolex: in-process Rolex API with file-based persistence
 *
 * Each scenario gets a fresh World instance. MCP clients are shared (expensive startup).
 */

import { existsSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { After, AfterAll, setWorldConstructor, World } from "@deepracticex/bdd";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { localPlatform } from "@rolexjs/local-platform";
import type { Role, RoleXBuilder } from "rolexjs";
import { createRoleX } from "rolexjs";

// ========== MCP client management ==========

const SERVER_PATH = join(import.meta.dirname, "../../apps/mcp-server/src/index.ts");

interface McpConnection {
  client: Client;
  transport: StdioClientTransport;
}

const connections = new Map<string, McpConnection>();

async function ensureMcpClient(mode: "dev" | "npx"): Promise<Client> {
  const existing = connections.get(mode);
  if (existing) return existing.client;

  let transport: StdioClientTransport;
  if (mode === "npx") {
    // Run npx from /tmp to avoid workspace overrides conflict
    transport = new StdioClientTransport({
      command: "npx",
      args: ["@rolexjs/mcp-server@dev"],
      cwd: tmpdir(),
    });
  } else {
    transport = new StdioClientTransport({
      command: "bun",
      args: ["run", SERVER_PATH],
    });
  }

  const client = new Client({
    name: `rolex-bdd-${mode}`,
    version: "1.0.0",
  });

  await client.connect(transport);
  connections.set(mode, { client, transport });
  return client;
}

AfterAll(async () => {
  for (const [, conn] of connections) {
    await conn.client.close();
    await conn.transport.close();
  }
  connections.clear();
});

// ========== World ==========

export class BddWorld extends World {
  // --- MCP layer ---
  client!: Client;
  toolResult?: string;
  tools?: Array<{ name: string }>;

  // --- Rolex layer ---
  dataDir?: string;
  rolex?: RoleXBuilder;
  role?: Role;
  directResult?: string;
  directRaw?: any;

  // --- Prototype migration layer ---
  protoMigrations?: Record<string, Array<{ file: string; ops: unknown[] }>>;
  settleResult?: string;

  // --- Shared ---
  error?: Error;

  /** Connect to MCP server (dev mode — local source). */
  async connect(): Promise<void> {
    this.client = await ensureMcpClient("dev");
  }

  /** Connect to MCP server (npx mode — published package). */
  async connectNpx(): Promise<void> {
    this.client = await ensureMcpClient("npx");
  }

  /** Initialize Rolex with a temp data directory for persistence tests. */
  async initRolex(): Promise<void> {
    this.dataDir = join(tmpdir(), `rolex-bdd-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(this.dataDir, { recursive: true });
    this.rolex = createRoleX({
      platform: localPlatform({ dataDir: this.dataDir, resourceDir: null }),
    });
  }

  /** Write persisted context directly via repository (simulate a previous session). */
  async writeContext(roleId: string, data: Record<string, unknown>): Promise<void> {
    if (!this.rolex) throw new Error("Call initRolex() first");
    const { service } = await this.rolex._internal();
    await (service as any).repo.saveContext(roleId, data);
  }

  /** Re-create Rolex instance (simulate new session with same dataDir). */
  async newSession(): Promise<void> {
    if (!this.dataDir) throw new Error("Call initRolex() first");
    this.rolex = createRoleX({
      platform: localPlatform({ dataDir: this.dataDir, resourceDir: null }),
    });
  }
}

After(function (this: BddWorld) {
  if (this.dataDir && existsSync(this.dataDir)) {
    rmSync(this.dataDir, { recursive: true });
  }
});

setWorldConstructor(BddWorld);
