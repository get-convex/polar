/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as example from "../example.js";

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
  example: typeof example;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  polar: {
    lib: {
      getOnboardingCheckoutUrl: FunctionReference<
        "action",
        "internal",
        {
          polarAccessToken: string;
          successUrl: string;
          userEmail: string;
          userId: string;
        },
        any
      >;
      listPlans: FunctionReference<"query", "internal", {}, any>;
      setSubscriptionPending: FunctionReference<
        "mutation",
        "internal",
        any,
        any
      >;
    };
  };
};
