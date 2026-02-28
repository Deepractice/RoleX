/**
 * MCP World — test context for MCP-level BDD tests.
 *
 * Manages a real MCP server child process connected via stdio transport.
 * Each scenario gets a fresh client connection.
 */

import { join } from "node:path";
import type { IWorldOptions } from "@deepracticex/bdd";
import { AfterAll, BeforeAll, setWorldConstructor, World } from "@deepracticex/bdd";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const SERVER_PATH = join(import.meta.dirname, "../../apps/mcp-server/src/index.ts");

// Shared client across scenarios (MCP startup is expensive)
let sharedClient: Client | null = null;
let sharedTransport: StdioClientTransport | null = null;

async function ensureClient(): Promise<Client> {
  if (sharedClient) return sharedClient;

  sharedTransport = new StdioClientTransport({
    command: "bun",
    args: ["run", SERVER_PATH],
  });

  sharedClient = new Client({
    name: "rolex-bdd-test",
    version: "1.0.0",
  });

  await sharedClient.connect(sharedTransport);
  return sharedClient;
}

AfterAll(async () => {
  if (sharedClient) {
    await sharedClient.close();
    sharedClient = null;
  }
  if (sharedTransport) {
    await sharedTransport.close();
    sharedTransport = null;
  }
});

export class McpWorld extends World {
  client!: Client;
  toolResult?: string;
  error?: Error;
  tools?: Array<{ name: string }>;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async connect(): Promise<void> {
    this.client = await ensureClient();
  }
}

setWorldConstructor(McpWorld);
