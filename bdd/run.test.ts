/**
 * BDD test entry point.
 *
 * Imports step definitions and support, then loads feature files.
 * Bun's test runner executes the generated describe/test blocks natively.
 */

import { loadFeature, setDefaultTimeout } from "@deepracticex/bdd";

// Support (unified world)
import "./support/world";

// Steps
import "./steps/mcp.steps";
import "./steps/context.steps";
import "./steps/direct.steps";
import "./steps/role.steps";

// Timeout: MCP/npx startup can take a while
setDefaultTimeout(60_000);

// ===== Journeys =====
loadFeature("bdd/journeys/mcp-startup.feature");
loadFeature("bdd/journeys/onboarding.feature");

// ===== Features =====
loadFeature("bdd/features/context-persistence.feature");
loadFeature("bdd/features/individual-lifecycle.feature");
loadFeature("bdd/features/organization-lifecycle.feature");
loadFeature("bdd/features/position-lifecycle.feature");
loadFeature("bdd/features/execution-loop.feature");
loadFeature("bdd/features/cognition-loop.feature");
