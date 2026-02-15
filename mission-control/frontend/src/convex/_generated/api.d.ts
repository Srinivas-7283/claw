/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agents from "../agents.js";
import type * as apiKeys from "../apiKeys.js";
import type * as apiUsage from "../apiUsage.js";
import type * as dashboard from "../dashboard.js";
import type * as debug from "../debug.js";
import type * as messaging from "../messaging.js"; // Manual patch
import type * as tasks from "../tasks.js";
import type * as telegram from "../telegram.js";
import type * as usageMetrics from "../usageMetrics.js";
import type * as workspaces from "../workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agents: typeof agents;
  apiKeys: typeof apiKeys;
  apiUsage: typeof apiUsage;
  dashboard: typeof dashboard;
  debug: typeof debug;
  messaging: typeof messaging;
  tasks: typeof tasks;
  telegram: typeof telegram;
  usageMetrics: typeof usageMetrics;
  workspaces: typeof workspaces;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
