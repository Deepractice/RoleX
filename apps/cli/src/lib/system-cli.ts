/**
 * system-cli — auto-derive citty commands from RunnableSystem process definitions.
 *
 * Converts zod params schemas to citty args and wires up the execute pipeline.
 * CLI is just a thin assembly layer over system definitions.
 */

import { defineCommand } from "citty";
import consola from "consola";
import { readFileSync } from "node:fs";
import type { RunnableSystem, Process } from "@rolexjs/system";
import { z } from "zod";

// ========== Types ==========

interface SystemCliOptions {
  /** Lazy system factory — called at runtime for each command execution. */
  getSystem: () => RunnableSystem | Promise<RunnableSystem>;
  /** Per-process overrides. */
  overrides?: Record<
    string,
    {
      getSystem?: () => RunnableSystem | Promise<RunnableSystem>;
      afterExecute?: (result: string, rawArgs: Record<string, any>) => void | Promise<void>;
    }
  >;
}

// ========== Zod Introspection Helpers ==========

/** Unwrap ZodOptional/ZodDefault to get the inner type. */
function unwrap(schema: z.ZodTypeAny): { inner: z.ZodTypeAny; optional: boolean } {
  if (schema instanceof z.ZodOptional) {
    return { inner: (schema as any)._def.innerType, optional: true };
  }
  if (schema instanceof z.ZodDefault) {
    return { inner: (schema as any)._def.innerType, optional: true };
  }
  return { inner: schema, optional: false };
}

/** Get the description from a zod schema (handles wrapped types). */
function getDesc(schema: z.ZodTypeAny): string {
  if (schema.description) return schema.description;
  const { inner } = unwrap(schema);
  return inner.description ?? "";
}

/** Check if a field name is a "source" field (Gherkin content that can come from --file). */
function isSourceField(name: string): boolean {
  return name === "source" || name.endsWith("Source");
}

/** Check if a zod type is a simple string or enum. */
function isSimple(schema: z.ZodTypeAny): boolean {
  return schema instanceof z.ZodString || schema instanceof z.ZodEnum;
}

// ========== Core: zodToArgs ==========

interface ArgsResult {
  args: Record<string, any>;
  transform: (rawArgs: Record<string, any>) => Record<string, any>;
}

/**
 * Convert a Process.params ZodObject into citty args + a transform function.
 *
 * Convention:
 * - Required string/enum fields (not source) → positional, in order
 * - Optional-only single field that's a simple string → optional positional
 * - Source fields → --source + --file alternative
 * - Arrays → comma-separated string flag
 * - Nested objects → flattened with camelCase prefix
 * - Unknown types → skipped
 */
function zodToArgs(schema: z.ZodObject<any>): ArgsResult {
  const shape = schema.shape as Record<string, z.ZodTypeAny>;
  const args: Record<string, any> = {};
  const transforms: Array<(raw: Record<string, any>, out: Record<string, any>) => void> = [];

  // Identify positional candidates: required simple non-source fields
  const positionalCandidates: string[] = [];
  for (const [key, field] of Object.entries(shape)) {
    if (isSourceField(key)) continue;
    const { inner, optional } = unwrap(field);
    if (isSimple(inner) && !optional) {
      positionalCandidates.push(key);
    }
  }

  // Special case: single optional field that's a simple string → optional positional
  const allKeys = Object.keys(shape);
  let optionalPositional: string | null = null;
  if (positionalCandidates.length === 0 && allKeys.length === 1) {
    const [key] = allKeys;
    const { inner, optional } = unwrap(shape[key]);
    if (optional && isSimple(inner)) {
      optionalPositional = key;
    }
  }

  // Generate args
  for (const [key, field] of Object.entries(shape)) {
    const { inner, optional } = unwrap(field);
    const desc = getDesc(field);

    if (isSourceField(key)) {
      // Source field: --source + --file alternative
      const fileKey = key === "source" ? "file" : key.replace(/Source$/, "File");
      args[key] = { type: "string", description: desc, required: !optional };
      args[fileKey] = {
        type: "string",
        ...(fileKey === "file" ? { alias: "f" } : {}),
        description: `Path to .feature file (alternative to --${camelToKebab(key)})`,
      };
      transforms.push((raw, out) => {
        if (raw[fileKey]) {
          out[key] = readFileSync(raw[fileKey], "utf-8");
        } else if (raw[key]) {
          out[key] = raw[key];
        } else if (!optional) {
          throw new Error(`Either --${camelToKebab(key)} or --${camelToKebab(fileKey)} is required.`);
        }
      });
    } else if (inner instanceof z.ZodArray) {
      // Array: comma-separated string
      args[key] = {
        type: "string",
        description: `${desc} (comma-separated)`,
        required: !optional,
      };
      transforms.push((raw, out) => {
        if (raw[key]) {
          out[key] = (raw[key] as string).split(",").map((s) => s.trim());
        }
      });
    } else if (inner instanceof z.ZodObject) {
      // Nested object: flatten with camelCase prefix
      flattenNestedObject(key, inner, optional, args, transforms);
    } else if (inner instanceof z.ZodUnknown || inner instanceof z.ZodAny) {
      // Unknown/Any: skip for CLI
    } else if (isSimple(inner)) {
      // Simple string/enum
      const isPositional = positionalCandidates.includes(key) || optionalPositional === key;
      args[key] = {
        type: isPositional ? "positional" : "string",
        description: desc,
        required: !optional,
      };
      transforms.push((raw, out) => {
        if (raw[key] !== undefined && raw[key] !== null) out[key] = raw[key];
      });
    }
  }

  return {
    args,
    transform(rawArgs: Record<string, any>): Record<string, any> {
      const out: Record<string, any> = {};
      for (const t of transforms) t(rawArgs, out);
      return out;
    },
  };
}

/** Flatten a nested ZodObject into CLI args with a camelCase prefix. */
function flattenNestedObject(
  prefix: string,
  schema: z.ZodObject<any>,
  parentOptional: boolean,
  args: Record<string, any>,
  transforms: Array<(raw: Record<string, any>, out: Record<string, any>) => void>
) {
  const shape = schema.shape as Record<string, z.ZodTypeAny>;
  const fieldKeys: Array<{ argKey: string; fieldKey: string; isSource: boolean }> = [];

  for (const [fieldKey, field] of Object.entries(shape)) {
    const { inner, optional: fieldOptional } = unwrap(field);
    const desc = getDesc(field);
    const argKey = `${prefix}${capitalize(fieldKey)}`;
    const isOptional = parentOptional || fieldOptional;

    if (isSourceField(fieldKey)) {
      // Nested source: --prefixSource + --prefixFile
      const fileArgKey = `${prefix}File`;
      args[argKey] = { type: "string", description: desc, required: !isOptional };
      args[fileArgKey] = {
        type: "string",
        description: `Path to .feature file (alternative to --${camelToKebab(argKey)})`,
      };
      fieldKeys.push({ argKey, fieldKey, isSource: true });
    } else {
      args[argKey] = { type: "string", description: desc, required: !isOptional };
      fieldKeys.push({ argKey, fieldKey, isSource: false });
    }
  }

  // Transform: reconstruct the nested object from flattened args
  transforms.push((raw, out) => {
    const obj: Record<string, any> = {};
    let hasAny = false;

    for (const { argKey, fieldKey, isSource } of fieldKeys) {
      if (isSource) {
        const fileArgKey = `${prefix}File`;
        if (raw[fileArgKey]) {
          obj[fieldKey] = readFileSync(raw[fileArgKey], "utf-8");
          hasAny = true;
        } else if (raw[argKey]) {
          obj[fieldKey] = raw[argKey];
          hasAny = true;
        }
      } else if (raw[argKey] !== undefined && raw[argKey] !== null) {
        obj[fieldKey] = raw[argKey];
        hasAny = true;
      }
    }

    if (hasAny) {
      out[prefix] = obj;
    }
  });
}

// ========== String Helpers ==========

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function camelToKebab(s: string): string {
  return s.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

// ========== Main API ==========

/**
 * Convert a process into a single citty command definition.
 */
function processToCli(
  proc: Process,
  getSystem: () => RunnableSystem | Promise<RunnableSystem>,
  afterExecute?: (result: string, rawArgs: Record<string, any>) => void | Promise<void>
) {
  const { args, transform } = zodToArgs(proc.params as z.ZodObject<any>);

  return defineCommand({
    meta: {
      name: proc.name,
      description: proc.description,
    },
    args,
    async run({ args: rawArgs }) {
      try {
        const system = await getSystem();
        const params = transform(rawArgs);
        const result = await system.execute(proc.name, params);
        consola.success(result);
        if (afterExecute) {
          await afterExecute(result, rawArgs);
        }
      } catch (error) {
        consola.error(error instanceof Error ? error.message : "Failed");
        globalThis.process.exit(1);
      }
    },
  });
}

/**
 * Generate citty subCommands from all processes in a system.
 *
 * This is the main API — turns a RunnableSystem into a CLI command group.
 *
 * @example
 * ```ts
 * const roleCommands = systemToCli(
 *   { name: "role", description: "Role System" },
 *   rolex.role.processes,
 *   { getSystem: () => createClient().role }
 * );
 * ```
 */
export function systemToCli(
  meta: { name: string; description: string },
  processes: Record<string, Process>,
  options: SystemCliOptions
) {
  const subCommands: Record<string, any> = {};

  for (const [name, proc] of Object.entries(processes)) {
    const override = options.overrides?.[name];
    const getSystem = override?.getSystem ?? options.getSystem;
    const afterExecute = override?.afterExecute;
    subCommands[name] = processToCli(proc, getSystem, afterExecute);
  }

  return defineCommand({
    meta: { name: meta.name, description: meta.description },
    subCommands,
  });
}
