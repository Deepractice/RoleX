/**
 * RoleX Builder — synchronous factory with lazy initialization.
 *
 * Usage:
 *   const rx = createBuilder({ platform, renderer });
 *   const role = await rx.role.activate({ individual: "sean" });
 *   await rx.society.born({ id: "alice", content: "Feature: Alice" });
 */

import type {
  Caller,
  CensusNamespace,
  IssueNamespace,
  OrgNamespace,
  PositionNamespace,
  ProductNamespace,
  ProjectNamespace,
  ResourceNamespace,
  RoleNamespace,
  SocietyNamespace,
} from "./namespaces.js";
import {
  createCensusNamespace,
  createIssueNamespace,
  createOrgNamespace,
  createPositionNamespace,
  createProductNamespace,
  createProjectNamespace,
  createResourceNamespace,
  createRoleNamespace,
  createSocietyNamespace,
} from "./namespaces.js";
import type { Platform, PrototypeData } from "./platform.js";
import type { Renderer } from "./renderer.js";
import { RoleXService } from "./rolex-service.js";
import { type JsonRpcRequest, type JsonRpcResponse, RpcHandler } from "./rpc.js";
import { protocol as defaultProtocol, type Protocol } from "./tools.js";

// ================================================================
//  RoleXBuilder interface
// ================================================================

export interface RoleXInternal {
  service: RoleXService;
}

export interface RoleXBuilder {
  /** Society-level operations — born, retire, crown, teach, train, found, dissolve. */
  readonly society: SocietyNamespace;
  /** Role management — activate, inspect, survey. */
  readonly role: RoleNamespace;
  /** Organization operations — charter, hire, fire, admin, launch, establish. */
  readonly org: OrgNamespace;
  /** Position operations — charge, require, appoint, dismiss. */
  readonly position: PositionNamespace;
  /** Project operations — scope, milestone, enroll, deliver, produce. */
  readonly project: ProjectNamespace;
  /** Product operations — strategy, spec, release, channel, own. */
  readonly product: ProductNamespace;
  /** Census — world-level queries. */
  readonly census: CensusNamespace;
  /** Issue tracking integration. */
  readonly issue: IssueNamespace;
  /** Resource management integration. */
  readonly resource: ResourceNamespace;

  /** Tool schemas + world instructions — the unified contract for any channel adapter. */
  readonly protocol: Protocol;

  /** Universal JSON-RPC 2.0 dispatch. */
  rpc<T = unknown>(request: JsonRpcRequest): Promise<JsonRpcResponse<T>>;

  /** Internal access for testing — not part of the public contract. */
  _internal(): Promise<RoleXInternal>;
}

// ================================================================
//  Builder config
// ================================================================

export interface BuilderConfig {
  platform: Platform;
  renderer: Renderer;
  /** Built-in prototypes to apply on initialization (e.g. genesis). */
  prototypes?: readonly PrototypeData[];
}

// ================================================================
//  createBuilder — synchronous, lazy init
// ================================================================

export function createBuilder(config: BuilderConfig): RoleXBuilder {
  let initPromise: Promise<{ handler: RpcHandler; service: RoleXService }> | null = null;

  function ensureInit() {
    if (!initPromise) {
      initPromise = (async () => {
        const service = await RoleXService.create(
          config.platform,
          config.renderer,
          config.prototypes
        );

        const handler = new RpcHandler({
          commands: service.commandMap,
          methods: {
            "role.activate": async (params) => {
              return service.activate(params.individual as string);
            },
            inspect: async (params) => {
              return service.inspect(params.id as string);
            },
            survey: async (params) => {
              return service.survey(params.type as string | undefined);
            },
          },
        });

        return { handler, service };
      })();
    }
    return initPromise;
  }

  // Caller function — bridge between namespaces and RpcHandler
  const call: Caller = async (method, params) => {
    const { handler } = await ensureInit();
    const response = await handler.handle({
      jsonrpc: "2.0",
      method,
      params,
      id: null,
    });
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.result;
  };

  // Create namespace instances (synchronous — they're just wrappers)
  const _society = createSocietyNamespace(call);
  const _role = createRoleNamespace(call);
  const _org = createOrgNamespace(call);
  const _position = createPositionNamespace(call);
  const _project = createProjectNamespace(call);
  const _product = createProductNamespace(call);
  const _census = createCensusNamespace(call);
  const _issue = createIssueNamespace(call);
  const _resource = createResourceNamespace(call);

  return {
    get society() {
      return _society;
    },
    get role() {
      return _role;
    },
    get org() {
      return _org;
    },
    get position() {
      return _position;
    },
    get project() {
      return _project;
    },
    get product() {
      return _product;
    },
    get census() {
      return _census;
    },
    get issue() {
      return _issue;
    },
    get resource() {
      return _resource;
    },

    protocol: defaultProtocol,

    async rpc<T>(request: JsonRpcRequest): Promise<JsonRpcResponse<T>> {
      const { handler } = await ensureInit();
      return handler.handle<T>(request);
    },

    async _internal(): Promise<RoleXInternal> {
      const { service } = await ensureInit();
      return { service };
    },
  };
}
