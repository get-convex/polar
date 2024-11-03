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
    init: {
      seedProducts: FunctionReference<
        "action",
        "internal",
        { polarAccessToken: string; polarOrganizationId: string },
        any
      >;
    };
    lib: {
      createUser: FunctionReference<
        "mutation",
        "internal",
        { userId: string },
        any
      >;
      deleteUserSubscription: FunctionReference<
        "mutation",
        "internal",
        { userId: string },
        any
      >;
      getOnboardingCheckoutUrl: FunctionReference<
        "action",
        "internal",
        {
          polarAccessToken: string;
          successUrl: string;
          userEmail?: string;
          userId: string;
        },
        any
      >;
      getPlanByKey: FunctionReference<
        "query",
        "internal",
        { key: "free" | "pro" },
        any
      >;
      getProOnboardingCheckoutUrl: FunctionReference<
        "action",
        "internal",
        {
          interval: "month" | "year";
          polarAccessToken: string;
          successUrl: string;
          userId: string;
        },
        any
      >;
      getUser: FunctionReference<
        "query",
        "internal",
        { userId: string },
        null | {
          polarId?: string;
          subscription?: {
            cancelAtPeriodEnd?: boolean;
            currency: "usd" | "eur";
            currentPeriodEnd?: number;
            currentPeriodStart?: number;
            interval: "month" | "year";
            localUserId: string;
            planId: string;
            polarId: string;
            polarPriceId: string;
            status: string;
          };
          subscriptionIsPending?: boolean;
          subscriptionPendingId?: string;
          userId: string;
        }
      >;
      getUserByLocalId: FunctionReference<
        "query",
        "internal",
        { localUserId: string },
        any
      >;
      listPlans: FunctionReference<"query", "internal", {}, any>;
      replaceSubscription: FunctionReference<
        "mutation",
        "internal",
        {
          input: {
            cancelAtPeriodEnd?: boolean;
            currency: "usd" | "eur";
            currentPeriodEnd?: number;
            currentPeriodStart: number;
            interval: "month" | "year";
            priceId: string;
            productId: string;
            status: string;
          };
          localUserId: string;
          subscriptionPolarId: string;
        },
        any
      >;
      setSubscriptionPending: FunctionReference<
        "mutation",
        "internal",
        { userId: string },
        any
      >;
    };
  };
};
