/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as lib from "../lib.js";
import type * as util from "../util.js";

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
  lib: typeof lib;
  util: typeof util;
}>;
export type Mounts = {
  lib: {
    createProduct: FunctionReference<
      "mutation",
      "public",
      {
        product: {
          createdAt: string;
          description: string | null;
          id: string;
          isArchived: boolean;
          isRecurring: boolean;
          medias: Array<{
            checksumEtag: string | null;
            checksumSha256Base64: string | null;
            checksumSha256Hex: string | null;
            createdAt: string;
            id: string;
            isUploaded: boolean;
            lastModifiedAt: string | null;
            mimeType: string;
            name: string;
            organizationId: string;
            path: string;
            publicUrl: string;
            service?: string;
            size: number;
            sizeReadable: string;
            storageVersion: string | null;
            version: string | null;
          }>;
          metadata?: Record<string, any>;
          modifiedAt: string | null;
          name: string;
          organizationId: string;
          prices: Array<{
            amountType?: string;
            createdAt: string;
            id: string;
            isArchived: boolean;
            modifiedAt: string | null;
            priceAmount?: number;
            priceCurrency?: string;
            productId: string;
            recurringInterval?: "month" | "year" | null;
            type?: string;
          }>;
          recurringInterval?: "month" | "year" | null;
        };
      },
      any
    >;
    createSubscription: FunctionReference<
      "mutation",
      "public",
      {
        subscription: {
          amount: number | null;
          cancelAtPeriodEnd: boolean;
          checkoutId: string | null;
          createdAt: string;
          currency: string | null;
          currentPeriodEnd: string | null;
          currentPeriodStart: string;
          customerCancellationComment?: string | null;
          customerCancellationReason?: string | null;
          customerId: string;
          endedAt: string | null;
          id: string;
          metadata: Record<string, any>;
          modifiedAt: string | null;
          priceId?: string;
          productId: string;
          recurringInterval: "month" | "year" | null;
          startedAt: string | null;
          status: string;
        };
      },
      any
    >;
    getCurrentSubscription: FunctionReference<
      "query",
      "public",
      { userId: string },
      {
        amount: number | null;
        cancelAtPeriodEnd: boolean;
        checkoutId: string | null;
        createdAt: string;
        currency: string | null;
        currentPeriodEnd: string | null;
        currentPeriodStart: string;
        customerCancellationComment?: string | null;
        customerCancellationReason?: string | null;
        customerId: string;
        endedAt: string | null;
        id: string;
        metadata: Record<string, any>;
        modifiedAt: string | null;
        priceId?: string;
        product: {
          createdAt: string;
          description: string | null;
          id: string;
          isArchived: boolean;
          isRecurring: boolean;
          medias: Array<{
            checksumEtag: string | null;
            checksumSha256Base64: string | null;
            checksumSha256Hex: string | null;
            createdAt: string;
            id: string;
            isUploaded: boolean;
            lastModifiedAt: string | null;
            mimeType: string;
            name: string;
            organizationId: string;
            path: string;
            publicUrl: string;
            service?: string;
            size: number;
            sizeReadable: string;
            storageVersion: string | null;
            version: string | null;
          }>;
          metadata?: Record<string, any>;
          modifiedAt: string | null;
          name: string;
          organizationId: string;
          prices: Array<{
            amountType?: string;
            createdAt: string;
            id: string;
            isArchived: boolean;
            modifiedAt: string | null;
            priceAmount?: number;
            priceCurrency?: string;
            productId: string;
            recurringInterval?: "month" | "year" | null;
            type?: string;
          }>;
          recurringInterval?: "month" | "year" | null;
        };
        productId: string;
        recurringInterval: "month" | "year" | null;
        startedAt: string | null;
        status: string;
      } | null
    >;
    getCustomerByUserId: FunctionReference<
      "query",
      "public",
      { userId: string },
      { id: string; metadata?: Record<string, any>; userId: string } | null
    >;
    getProduct: FunctionReference<
      "query",
      "public",
      { id: string },
      {
        createdAt: string;
        description: string | null;
        id: string;
        isArchived: boolean;
        isRecurring: boolean;
        medias: Array<{
          checksumEtag: string | null;
          checksumSha256Base64: string | null;
          checksumSha256Hex: string | null;
          createdAt: string;
          id: string;
          isUploaded: boolean;
          lastModifiedAt: string | null;
          mimeType: string;
          name: string;
          organizationId: string;
          path: string;
          publicUrl: string;
          service?: string;
          size: number;
          sizeReadable: string;
          storageVersion: string | null;
          version: string | null;
        }>;
        metadata?: Record<string, any>;
        modifiedAt: string | null;
        name: string;
        organizationId: string;
        prices: Array<{
          amountType?: string;
          createdAt: string;
          id: string;
          isArchived: boolean;
          modifiedAt: string | null;
          priceAmount?: number;
          priceCurrency?: string;
          productId: string;
          recurringInterval?: "month" | "year" | null;
          type?: string;
        }>;
        recurringInterval?: "month" | "year" | null;
      } | null
    >;
    getSubscription: FunctionReference<
      "query",
      "public",
      { id: string },
      {
        amount: number | null;
        cancelAtPeriodEnd: boolean;
        checkoutId: string | null;
        createdAt: string;
        currency: string | null;
        currentPeriodEnd: string | null;
        currentPeriodStart: string;
        customerCancellationComment?: string | null;
        customerCancellationReason?: string | null;
        customerId: string;
        endedAt: string | null;
        id: string;
        metadata: Record<string, any>;
        modifiedAt: string | null;
        priceId?: string;
        productId: string;
        recurringInterval: "month" | "year" | null;
        startedAt: string | null;
        status: string;
      } | null
    >;
    insertCustomer: FunctionReference<
      "mutation",
      "public",
      { id: string; metadata?: Record<string, any>; userId: string },
      string
    >;
    listCustomerSubscriptions: FunctionReference<
      "query",
      "public",
      { customerId: string },
      Array<{
        amount: number | null;
        cancelAtPeriodEnd: boolean;
        checkoutId: string | null;
        createdAt: string;
        currency: string | null;
        currentPeriodEnd: string | null;
        currentPeriodStart: string;
        customerCancellationComment?: string | null;
        customerCancellationReason?: string | null;
        customerId: string;
        endedAt: string | null;
        id: string;
        metadata: Record<string, any>;
        modifiedAt: string | null;
        priceId?: string;
        productId: string;
        recurringInterval: "month" | "year" | null;
        startedAt: string | null;
        status: string;
      }>
    >;
    listProducts: FunctionReference<
      "query",
      "public",
      { includeArchived?: boolean },
      Array<{
        createdAt: string;
        description: string | null;
        id: string;
        isArchived: boolean;
        isRecurring: boolean;
        medias: Array<{
          checksumEtag: string | null;
          checksumSha256Base64: string | null;
          checksumSha256Hex: string | null;
          createdAt: string;
          id: string;
          isUploaded: boolean;
          lastModifiedAt: string | null;
          mimeType: string;
          name: string;
          organizationId: string;
          path: string;
          publicUrl: string;
          service?: string;
          size: number;
          sizeReadable: string;
          storageVersion: string | null;
          version: string | null;
        }>;
        metadata?: Record<string, any>;
        modifiedAt: string | null;
        name: string;
        organizationId: string;
        priceAmount?: number;
        prices: Array<{
          amountType?: string;
          createdAt: string;
          id: string;
          isArchived: boolean;
          modifiedAt: string | null;
          priceAmount?: number;
          priceCurrency?: string;
          productId: string;
          recurringInterval?: "month" | "year" | null;
          type?: string;
        }>;
        recurringInterval?: "month" | "year" | null;
      }>
    >;
    listUserSubscriptions: FunctionReference<
      "query",
      "public",
      { userId: string },
      Array<{
        amount: number | null;
        cancelAtPeriodEnd: boolean;
        checkoutId: string | null;
        createdAt: string;
        currency: string | null;
        currentPeriodEnd: string | null;
        currentPeriodStart: string;
        customerCancellationComment?: string | null;
        customerCancellationReason?: string | null;
        customerId: string;
        endedAt: string | null;
        id: string;
        metadata: Record<string, any>;
        modifiedAt: string | null;
        priceId?: string;
        product: {
          createdAt: string;
          description: string | null;
          id: string;
          isArchived: boolean;
          isRecurring: boolean;
          medias: Array<{
            checksumEtag: string | null;
            checksumSha256Base64: string | null;
            checksumSha256Hex: string | null;
            createdAt: string;
            id: string;
            isUploaded: boolean;
            lastModifiedAt: string | null;
            mimeType: string;
            name: string;
            organizationId: string;
            path: string;
            publicUrl: string;
            service?: string;
            size: number;
            sizeReadable: string;
            storageVersion: string | null;
            version: string | null;
          }>;
          metadata?: Record<string, any>;
          modifiedAt: string | null;
          name: string;
          organizationId: string;
          prices: Array<{
            amountType?: string;
            createdAt: string;
            id: string;
            isArchived: boolean;
            modifiedAt: string | null;
            priceAmount?: number;
            priceCurrency?: string;
            productId: string;
            recurringInterval?: "month" | "year" | null;
            type?: string;
          }>;
          recurringInterval?: "month" | "year" | null;
        } | null;
        productId: string;
        recurringInterval: "month" | "year" | null;
        startedAt: string | null;
        status: string;
      }>
    >;
    updateProduct: FunctionReference<
      "mutation",
      "public",
      {
        product: {
          createdAt: string;
          description: string | null;
          id: string;
          isArchived: boolean;
          isRecurring: boolean;
          medias: Array<{
            checksumEtag: string | null;
            checksumSha256Base64: string | null;
            checksumSha256Hex: string | null;
            createdAt: string;
            id: string;
            isUploaded: boolean;
            lastModifiedAt: string | null;
            mimeType: string;
            name: string;
            organizationId: string;
            path: string;
            publicUrl: string;
            service?: string;
            size: number;
            sizeReadable: string;
            storageVersion: string | null;
            version: string | null;
          }>;
          metadata?: Record<string, any>;
          modifiedAt: string | null;
          name: string;
          organizationId: string;
          prices: Array<{
            amountType?: string;
            createdAt: string;
            id: string;
            isArchived: boolean;
            modifiedAt: string | null;
            priceAmount?: number;
            priceCurrency?: string;
            productId: string;
            recurringInterval?: "month" | "year" | null;
            type?: string;
          }>;
          recurringInterval?: "month" | "year" | null;
        };
      },
      any
    >;
    updateSubscription: FunctionReference<
      "mutation",
      "public",
      {
        subscription: {
          amount: number | null;
          cancelAtPeriodEnd: boolean;
          checkoutId: string | null;
          createdAt: string;
          currency: string | null;
          currentPeriodEnd: string | null;
          currentPeriodStart: string;
          customerCancellationComment?: string | null;
          customerCancellationReason?: string | null;
          customerId: string;
          endedAt: string | null;
          id: string;
          metadata: Record<string, any>;
          modifiedAt: string | null;
          priceId?: string;
          productId: string;
          recurringInterval: "month" | "year" | null;
          startedAt: string | null;
          status: string;
        };
      },
      any
    >;
    upsertCustomer: FunctionReference<
      "mutation",
      "public",
      { id: string; metadata?: Record<string, any>; userId: string },
      string
    >;
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
