/**
 * @rolexjs/mcp-server — individual-level MCP tools.
 *
 * Pure pass-through: all rendering happens in rolexjs.
 * MCP only translates protocol calls to API calls.
 *
 * Tool schemas are defined once in @rolexjs/prototype (tools)
 * and converted to Zod here for FastMCP registration.
 */

import { genesis } from "@rolexjs/genesis";
import { localPlatform } from "@rolexjs/local-platform";
import { FastMCP } from "fastmcp";
import {
  createRoleX,
  detail,
  type ParamDef,
  type ProductAction,
  type ProjectAction,
  protocol,
  renderProductResult,
  renderProjectResult,
  type State,
  type ToolDef,
} from "rolexjs";

import { z } from "zod";
import { McpState } from "./state.js";

// ========== Setup ==========

const rolex = await createRoleX(
  localPlatform({
    prototypes: [genesis],
  })
);
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

type ToolExecutor = (params: Record<string, unknown>) => Promise<string>;

const executors: Record<string, ToolExecutor> = {
  async activate({ roleId }) {
    try {
      const role = await rolex.activate(roleId as string);
      state.role = role;
      return await role.project();
    } catch {
      const census = await rolex.direct<string>("!census.list");
      throw new Error(
        `"${roleId}" not found. Available:\n\n${census}\n\nTry again with the correct id or alias.`
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
    const a = args as Record<string, unknown> | undefined;
    const result = await state
      .requireRole()
      .use(command as string, a && Object.keys(a).length > 0 ? a : undefined);
    if (result == null) return `${command} done.`;
    if (typeof result === "string") return result;
    return JSON.stringify(result, null, 2);
  },

  async direct({ command, args }) {
    const a = args as Record<string, unknown> | undefined;
    const result = await rolex.direct(
      command as string,
      a && Object.keys(a).length > 0 ? a : undefined
    );
    if (result == null) return `${command} done.`;
    if (typeof result === "string") return result;
    if ((command as string) === "!project.produce") {
      const opResult = result as { state: State };
      return renderProductResult("produce" as ProductAction, opResult.state);
    }
    if ((command as string).startsWith("!project.")) {
      const action = (command as string).slice("!project.".length) as ProjectAction;
      const opResult = result as { state: State };
      return renderProjectResult(action, opResult.state);
    }
    if ((command as string).startsWith("!product.")) {
      const action = (command as string).slice("!product.".length) as ProductAction;
      const opResult = result as { state: State };
      return renderProductResult(action, opResult.state);
    }
    return JSON.stringify(result, null, 2);
  },
};

// ========== Server ==========

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
    description: detail(toolDef.name),
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
