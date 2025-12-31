/* eslint-disable */
/**
 * Generated `ComponentApi` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

/**
 * A utility for referencing a Convex component's exposed API.
 *
 * Useful when expecting a parameter like `components.myComponent`.
 * Usage:
 * ```ts
 * async function myFunction(ctx: QueryCtx, component: ComponentApi) {
 *   return ctx.runQuery(component.someFile.someQuery, { ...args });
 * }
 * ```
 */
export type ComponentApi<Name extends string | undefined = string | undefined> =
  {
    lib: {
      createProduct: FunctionReference<
        "mutation",
        "internal",
        {
          product: {
            benefits: Array<{
              createdAt: string;
              deletable: boolean;
              description: string;
              id: string;
              metadata?: Record<string, any>;
              modifiedAt: string | null;
              organizationId: string;
              properties?: any;
              selectable: boolean;
              type: string;
            }>;
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
              capAmount?: number | null;
              createdAt: string;
              id: string;
              isArchived: boolean;
              maximumAmount?: number | null;
              meter?: { id: string; name: string };
              meterId?: string;
              minimumAmount?: number | null;
              modifiedAt: string | null;
              presetAmount?: number | null;
              priceAmount?: number;
              priceCurrency?: string;
              productId: string;
              recurringInterval?: "day" | "week" | "month" | "year" | null;
              seatTiers?: Array<{
                maxSeats: number | null;
                minSeats: number;
                pricePerSeat: number;
              }>;
              type?: string;
              unitAmount?: string;
            }>;
            recurringInterval?: "day" | "week" | "month" | "year" | null;
          };
        },
        any,
        Name
      >;
      createSubscription: FunctionReference<
        "mutation",
        "internal",
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
            recurringInterval: "day" | "week" | "month" | "year" | null;
            startedAt: string | null;
            status: string;
          };
        },
        any,
        Name
      >;
      getCurrentSubscription: FunctionReference<
        "query",
        "internal",
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
            benefits: Array<{
              createdAt: string;
              deletable: boolean;
              description: string;
              id: string;
              metadata?: Record<string, any>;
              modifiedAt: string | null;
              organizationId: string;
              properties?: any;
              selectable: boolean;
              type: string;
            }>;
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
              capAmount?: number | null;
              createdAt: string;
              id: string;
              isArchived: boolean;
              maximumAmount?: number | null;
              meter?: { id: string; name: string };
              meterId?: string;
              minimumAmount?: number | null;
              modifiedAt: string | null;
              presetAmount?: number | null;
              priceAmount?: number;
              priceCurrency?: string;
              productId: string;
              recurringInterval?: "day" | "week" | "month" | "year" | null;
              seatTiers?: Array<{
                maxSeats: number | null;
                minSeats: number;
                pricePerSeat: number;
              }>;
              type?: string;
              unitAmount?: string;
            }>;
            recurringInterval?: "day" | "week" | "month" | "year" | null;
          };
          productId: string;
          recurringInterval: "day" | "week" | "month" | "year" | null;
          startedAt: string | null;
          status: string;
        } | null,
        Name
      >;
      getCustomerByUserId: FunctionReference<
        "query",
        "internal",
        { userId: string },
        { id: string; metadata?: Record<string, any>; userId: string } | null,
        Name
      >;
      getProduct: FunctionReference<
        "query",
        "internal",
        { id: string },
        {
          benefits: Array<{
            createdAt: string;
            deletable: boolean;
            description: string;
            id: string;
            metadata?: Record<string, any>;
            modifiedAt: string | null;
            organizationId: string;
            properties?: any;
            selectable: boolean;
            type: string;
          }>;
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
            capAmount?: number | null;
            createdAt: string;
            id: string;
            isArchived: boolean;
            maximumAmount?: number | null;
            meter?: { id: string; name: string };
            meterId?: string;
            minimumAmount?: number | null;
            modifiedAt: string | null;
            presetAmount?: number | null;
            priceAmount?: number;
            priceCurrency?: string;
            productId: string;
            recurringInterval?: "day" | "week" | "month" | "year" | null;
            seatTiers?: Array<{
              maxSeats: number | null;
              minSeats: number;
              pricePerSeat: number;
            }>;
            type?: string;
            unitAmount?: string;
          }>;
          recurringInterval?: "day" | "week" | "month" | "year" | null;
        } | null,
        Name
      >;
      getSubscription: FunctionReference<
        "query",
        "internal",
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
          recurringInterval: "day" | "week" | "month" | "year" | null;
          startedAt: string | null;
          status: string;
        } | null,
        Name
      >;
      insertCustomer: FunctionReference<
        "mutation",
        "internal",
        { id: string; metadata?: Record<string, any>; userId: string },
        string,
        Name
      >;
      listCustomerSubscriptions: FunctionReference<
        "query",
        "internal",
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
          recurringInterval: "day" | "week" | "month" | "year" | null;
          startedAt: string | null;
          status: string;
        }>,
        Name
      >;
      listProducts: FunctionReference<
        "query",
        "internal",
        { includeArchived?: boolean },
        Array<{
          benefits: Array<{
            createdAt: string;
            deletable: boolean;
            description: string;
            id: string;
            metadata?: Record<string, any>;
            modifiedAt: string | null;
            organizationId: string;
            properties?: any;
            selectable: boolean;
            type: string;
          }>;
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
            capAmount?: number | null;
            createdAt: string;
            id: string;
            isArchived: boolean;
            maximumAmount?: number | null;
            meter?: { id: string; name: string };
            meterId?: string;
            minimumAmount?: number | null;
            modifiedAt: string | null;
            presetAmount?: number | null;
            priceAmount?: number;
            priceCurrency?: string;
            productId: string;
            recurringInterval?: "day" | "week" | "month" | "year" | null;
            seatTiers?: Array<{
              maxSeats: number | null;
              minSeats: number;
              pricePerSeat: number;
            }>;
            type?: string;
            unitAmount?: string;
          }>;
          recurringInterval?: "day" | "week" | "month" | "year" | null;
        }>,
        Name
      >;
      listUserSubscriptions: FunctionReference<
        "query",
        "internal",
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
            benefits: Array<{
              createdAt: string;
              deletable: boolean;
              description: string;
              id: string;
              metadata?: Record<string, any>;
              modifiedAt: string | null;
              organizationId: string;
              properties?: any;
              selectable: boolean;
              type: string;
            }>;
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
              capAmount?: number | null;
              createdAt: string;
              id: string;
              isArchived: boolean;
              maximumAmount?: number | null;
              meter?: { id: string; name: string };
              meterId?: string;
              minimumAmount?: number | null;
              modifiedAt: string | null;
              presetAmount?: number | null;
              priceAmount?: number;
              priceCurrency?: string;
              productId: string;
              recurringInterval?: "day" | "week" | "month" | "year" | null;
              seatTiers?: Array<{
                maxSeats: number | null;
                minSeats: number;
                pricePerSeat: number;
              }>;
              type?: string;
              unitAmount?: string;
            }>;
            recurringInterval?: "day" | "week" | "month" | "year" | null;
          } | null;
          productId: string;
          recurringInterval: "day" | "week" | "month" | "year" | null;
          startedAt: string | null;
          status: string;
        }>,
        Name
      >;
      syncProducts: FunctionReference<
        "action",
        "internal",
        { polarAccessToken: string; server: "sandbox" | "production" },
        any,
        Name
      >;
      updateProduct: FunctionReference<
        "mutation",
        "internal",
        {
          product: {
            benefits: Array<{
              createdAt: string;
              deletable: boolean;
              description: string;
              id: string;
              metadata?: Record<string, any>;
              modifiedAt: string | null;
              organizationId: string;
              properties?: any;
              selectable: boolean;
              type: string;
            }>;
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
              capAmount?: number | null;
              createdAt: string;
              id: string;
              isArchived: boolean;
              maximumAmount?: number | null;
              meter?: { id: string; name: string };
              meterId?: string;
              minimumAmount?: number | null;
              modifiedAt: string | null;
              presetAmount?: number | null;
              priceAmount?: number;
              priceCurrency?: string;
              productId: string;
              recurringInterval?: "day" | "week" | "month" | "year" | null;
              seatTiers?: Array<{
                maxSeats: number | null;
                minSeats: number;
                pricePerSeat: number;
              }>;
              type?: string;
              unitAmount?: string;
            }>;
            recurringInterval?: "day" | "week" | "month" | "year" | null;
          };
        },
        any,
        Name
      >;
      updateProducts: FunctionReference<
        "mutation",
        "internal",
        {
          polarAccessToken: string;
          products: Array<{
            benefits: Array<{
              createdAt: string;
              deletable: boolean;
              description: string;
              id: string;
              metadata?: Record<string, any>;
              modifiedAt: string | null;
              organizationId: string;
              properties?: any;
              selectable: boolean;
              type: string;
            }>;
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
              capAmount?: number | null;
              createdAt: string;
              id: string;
              isArchived: boolean;
              maximumAmount?: number | null;
              meter?: { id: string; name: string };
              meterId?: string;
              minimumAmount?: number | null;
              modifiedAt: string | null;
              presetAmount?: number | null;
              priceAmount?: number;
              priceCurrency?: string;
              productId: string;
              recurringInterval?: "day" | "week" | "month" | "year" | null;
              seatTiers?: Array<{
                maxSeats: number | null;
                minSeats: number;
                pricePerSeat: number;
              }>;
              type?: string;
              unitAmount?: string;
            }>;
            recurringInterval?: "day" | "week" | "month" | "year" | null;
          }>;
        },
        any,
        Name
      >;
      updateSubscription: FunctionReference<
        "mutation",
        "internal",
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
            recurringInterval: "day" | "week" | "month" | "year" | null;
            startedAt: string | null;
            status: string;
          };
        },
        any,
        Name
      >;
      upsertCustomer: FunctionReference<
        "mutation",
        "internal",
        { id: string; metadata?: Record<string, any>; userId: string },
        string,
        Name
      >;
    };
  };
