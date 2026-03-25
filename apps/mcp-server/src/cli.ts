#!/usr/bin/env node

/**
 * rolex-mcp CLI — manage the MCP server.
 *
 * Usage:
 *   rolex-mcp                    stdio mode (default, for MCP clients)
 *   rolex-mcp --http             HTTP foreground mode
 *   rolex-mcp start              start HTTP server in background
 *   rolex-mcp stop               stop background server
 *   rolex-mcp status             check if server is running
 *   rolex-mcp restart            restart background server
 *
 * Options:
 *   --port=N                     HTTP port (default: 8787)
 */

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const DATA_DIR = join(homedir(), ".deepractice", "rolex");
const PID_FILE = join(DATA_DIR, "mcp-server.pid");
const LOG_FILE = join(DATA_DIR, "mcp-server.log");

function getPort(): number {
  const arg = process.argv.find((a) => a.startsWith("--port="));
  return arg ? Number(arg.split("=")[1]) : 8787;
}

function readPid(): number | null {
  try {
    return Number(readFileSync(PID_FILE, "utf-8").trim()) || null;
  } catch {
    return null;
  }
}

function isRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function cleanup() {
  try {
    unlinkSync(PID_FILE);
  } catch {}
}

// ========== Commands ==========

function statusCmd() {
  const pid = readPid();
  if (pid && isRunning(pid)) {
    console.log(`rolex-mcp is running (pid: ${pid})`);
    console.log(`  log: ${LOG_FILE}`);
    console.log(`  pid: ${PID_FILE}`);
  } else {
    if (pid) cleanup();
    console.log("rolex-mcp is not running");
  }
}

function stopCmd() {
  const pid = readPid();
  if (!pid || !isRunning(pid)) {
    console.log("rolex-mcp is not running");
    cleanup();
    return;
  }
  process.kill(pid, "SIGTERM");
  console.log(`rolex-mcp stopped (pid: ${pid})`);
  cleanup();
}

function startCmd() {
  const existingPid = readPid();
  if (existingPid && isRunning(existingPid)) {
    console.log(`rolex-mcp is already running (pid: ${existingPid})`);
    return;
  }
  cleanup();

  const port = getPort();
  mkdirSync(DATA_DIR, { recursive: true });

  // Spawn detached process running this same file with --http
  const child = spawn(process.execPath, [process.argv[1], "--http", `--port=${port}`], {
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, ROLEX_MCP_DAEMON: "1" },
  });

  // Redirect stdout/stderr to log file
  const { createWriteStream } = require("node:fs");
  const logStream = createWriteStream(LOG_FILE, { flags: "a" });
  child.stdout?.pipe(logStream);
  child.stderr?.pipe(logStream);

  child.unref();
  writeFileSync(PID_FILE, String(child.pid));
  console.log(`rolex-mcp started on http://localhost:${port}/mcp (pid: ${child.pid})`);
  console.log(`  log: ${LOG_FILE}`);
}

function restartCmd() {
  stopCmd();
  startCmd();
}

async function runServer() {
  const { server } = await import("./index.js");
  const useHttp = process.argv.includes("--http");
  const port = getPort();

  if (useHttp) {
    server.start({
      transportType: "httpStream",
      httpStream: { port },
    });
  } else {
    server.start({
      transportType: "stdio",
    });
  }
}

// ========== Main ==========

const cmd = process.argv[2];

switch (cmd) {
  case "start":
    startCmd();
    break;
  case "stop":
    stopCmd();
    break;
  case "status":
    statusCmd();
    break;
  case "restart":
    restartCmd();
    break;
  default:
    // No subcommand: run server directly (stdio or --http foreground)
    runServer();
}
