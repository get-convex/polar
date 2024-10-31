/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as email_index from "../email/index.js";
import type * as email_templates_subscriptionEmail from "../email/templates/subscriptionEmail.js";
import type * as init from "../init.js";
import type * as lib from "../lib.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "email/index": typeof email_index;
  "email/templates/subscriptionEmail": typeof email_templates_subscriptionEmail;
  init: typeof init;
  lib: typeof lib;
}>;
export type Mounts = {
  lib: {
    getOnboardingCheckoutUrl: FunctionReference<
      "action",
      "public",
      {
        polarAccessToken: string;
        successUrl: string;
        userEmail: string;
        userId: string;
      },
      any
    >;
    listPlans: FunctionReference<"query", "public", {}, any>;
    setSubscriptionPending: FunctionReference<"mutation", "public", any, any>;
  };
};
// For now fullApiWithMounts is only fullApi which provides
// jump-to-definition in component client code.
// Use Mounts for the same type without the inference.
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
