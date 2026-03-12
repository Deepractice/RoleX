/**
 * @rolexjs/mcp-server — individual-level MCP tools.
 *
 * Pure pass-through: all rendering happens in rolexjs.
 * MCP only translates protocol calls to API calls.
 *
 * Tool schemas are defined once in @rolexjs/core (tools)
 * and converted to Zod here for FastMCP registration.
 */

import { localPlatform } from "@rolexjs/local-platform";
import { FastMCP } from "fastmcp";
import {
  createRoleX,
  type ParamDef,
  type ProductAction,
  type ProjectAction,
  renderProductResult,
  renderProjectResult,
  type State,
  type ToolDef,
} from "rolexjs";

import { z } from "zod";
import { McpState } from "./state.js";

// ========== Setup ==========

const rolex = createRoleX({
  platform: localPlatform(),
});
const state = new McpState();

// ========== Zod conversion ==========

function paramToZod(param: ParamDef, required: boolean): z.ZodTypeAny {
  let zodType: z.ZodTypeAny;
  switch (param.type) {
    case "string":
    case "gherkin":
      zodType = z.string();
      break;
    case "string[]":
      zodType = z.array(z.string());
      break;
    case "number":
      zodType = z.number();
      break;
    case "record":
      zodType = z.record(z.unknown());
      break;
    default:
      zodType = z.unknown();
  }
  zodType = zodType.describe(param.description);
  if (!required) zodType = zodType.optional();
  return zodType;
}

function toZodSchema(def: ToolDef): z.ZodTypeAny {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const [key, param] of Object.entries(def.params)) {
    shape[key] = paramToZod(param, param.required);
  }
  const schema = z.object(shape);
  return schema;
}

// ========== Tool execution ==========

/** Defensive args parsing — some AI models serialize args as a JSON string instead of an object. */
function parseArgs(args: unknown): Record<string, unknown> | undefined {
  if (args == null) return undefined;
  if (typeof args === "object") return args as Record<string, unknown>;
  if (typeof args === "string") {
    try {
      const parsed = JSON.parse(args);
      if (typeof parsed === "object" && parsed !== null) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      // not valid JSON, ignore
    }
  }
  return undefined;
}

type ToolExecutor = (params: Record<string, unknown>) => Promise<string>;

const executors: Record<string, ToolExecutor> = {
  async inspect({ id }) {
    return await rolex.role.inspect({ id: id as string });
  },

  async survey({ type }) {
    return await rolex.role.survey({ type: type as string | undefined });
  },

  async activate({ roleId }) {
    try {
      const role = await rolex.role.activate({ individual: roleId as string });
      state.role = role;
      return await role.project();
    } catch {
      const census = await rolex.census.list();
      throw new Error(
        `"${roleId}" not found. Available:\n\n${JSON.stringify(census)}\n\nTry again with the correct id or alias.`
      );
    }
  },

  async focus({ id }) {
    return await state.requireRole().focus(id as string | undefined);
  },

  async want({ id, goal }) {
    return await state.requireRole().want(goal as string, id as string);
  },

  async plan({ id, plan, after, fallback }) {
    return await state
      .requireRole()
      .plan(
        plan as string,
        id as string,
        after as string | undefined,
        fallback as string | undefined
      );
  },

  async todo({ id, task }) {
    return await state.requireRole().todo(task as string, id as string);
  },

  async finish({ id, encounter }) {
    return await state.requireRole().finish(id as string, encounter as string | undefined);
  },

  async complete({ id, encounter }) {
    return await state
      .requireRole()
      .complete(id as string | undefined, encounter as string | undefined);
  },

  async abandon({ id, encounter }) {
    return await state
      .requireRole()
      .abandon(id as string | undefined, encounter as string | undefined);
  },

  async reflect({ ids, id, experience }) {
    return await state
      .requireRole()
      .reflect(ids as string[], experience as string | undefined, id as string);
  },

  async realize({ ids, id, principle }) {
    return await state
      .requireRole()
      .realize(ids as string[], principle as string | undefined, id as string);
  },

  async master({ ids, id, procedure }) {
    return await state
      .requireRole()
      .master(procedure as string, id as string, ids as string[] | undefined);
  },

  async forget({ id }) {
    return await state.requireRole().forget(id as string);
  },

  async skill({ locator }) {
    return await state.requireRole().skill(locator as string);
  },

  async use({ command, args }) {
    const a = parseArgs(args);
    const result = await state
      .requireRole()
      .use(command as string, a && Object.keys(a).length > 0 ? a : undefined);
    if (result == null) return `${command} done.`;
    if (typeof result === "string") return result;
    return JSON.stringify(result, null, 2);
  },

  async direct({ command, args }) {
    const a = parseArgs(args);
    // Strip "!" prefix for JSON-RPC method name
    const method = (command as string).startsWith("!")
      ? (command as string).slice(1)
      : (command as string);
    const response = await rolex.rpc({
      jsonrpc: "2.0",
      method,
      params: a && Object.keys(a).length > 0 ? a : undefined,
      id: null,
    });
    if (response.error) throw new Error(response.error.message);
    const result = response.result;
    if (result == null) return `${command} done.`;
    if (typeof result === "string") return result;
    if (method === "project.produce") {
      const opResult = result as { state: State };
      return renderProductResult("produce" as ProductAction, opResult.state);
    }
    if (method.startsWith("project.")) {
      const action = method.slice("project.".length) as ProjectAction;
      const opResult = result as { state: State };
      return renderProjectResult(action, opResult.state);
    }
    if (method.startsWith("product.")) {
      const action = method.slice("product.".length) as ProductAction;
      const opResult = result as { state: State };
      return renderProductResult(action, opResult.state);
    }
    return JSON.stringify(result, null, 2);
  },
};

// ========== Server ==========

const { protocol } = rolex;

const server = new FastMCP({
  name: "rolex",
  version: "0.12.0",
  instructions: protocol.instructions,
});

// Register all tools from unified schema
for (const toolDef of protocol.tools) {
  const executor = executors[toolDef.name];
  if (!executor) {
    throw new Error(`No executor for tool "${toolDef.name}"`);
  }

  server.addTool({
    name: toolDef.name,
    description: toolDef.description,
    parameters: toZodSchema(toolDef),
    execute: async (params) => {
      return await executor(params as Record<string, unknown>);
    },
  });
}

// ========== Start ==========

server.start({
  transportType: "stdio",
});
