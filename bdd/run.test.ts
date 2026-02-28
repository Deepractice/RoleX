/**
 * BDD test entry point.
 *
 * Imports step definitions and support, then loads feature files.
 * Bun's test runner executes the generated describe/test blocks natively.
 */

import { loadFeature, setDefaultTimeout } from "@deepracticex/bdd";

// Support
import "./support/mcp-world";

// Steps
import "./steps/mcp.steps";

// Timeout: MCP server startup can take a few seconds
setDefaultTimeout(15_000);

// ===== Journeys =====
loadFeature("bdd/journeys/mcp-startup.feature");
