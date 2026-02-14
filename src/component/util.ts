import type {
  GenericMutationCtx,
  GenericActionCtx,
  GenericQueryCtx,
  GenericDataModel,
} from "convex/server";
import type { Subscription } from "@polar-sh/sdk/models/components/subscription.js";
import type { Product } from "@polar-sh/sdk/models/components/product.js";
import type { Infer } from "convex/values";
import type schema from "./schema.js";

export type RunQueryCtx = {
  runQuery: GenericQueryCtx<GenericDataModel>["runQuery"];
};
export type RunMutationCtx = {
  runQuery: GenericQueryCtx<GenericDataModel>["runQuery"];
  runMutation: GenericMutationCtx<GenericDataModel>["runMutation"];
};
export type RunActionCtx = {
  runQuery: GenericQueryCtx<GenericDataModel>["runQuery"];
  runMutation: GenericMutationCtx<GenericDataModel>["runMutation"];
  runAction: GenericActionCtx<GenericDataModel>["runAction"];
};

export const convertToDatabaseSubscription = (
  subscription: Subscription,
): Infer<typeof schema.tables.subscriptions.validator> => {
  return {
    id: subscription.id,
    customerId: subscription.customerId,
    createdAt: subscription.createdAt.toISOString(),
    modifiedAt: subscription.modifiedAt?.toISOString() ?? null,
    productId: subscription.productId,
    checkoutId: subscription.checkoutId,
    amount: subscription.amount,
    currency: subscription.currency,
    recurringInterval: subscription.recurringInterval,
    status: subscription.status,
    currentPeriodStart: subscription.currentPeriodStart.toISOString(),
    currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    customerCancellationReason: subscription.customerCancellationReason,
    customerCancellationComment: subscription.customerCancellationComment,
    startedAt: subscription.startedAt?.toISOString() ?? null,
    endedAt: subscription.endedAt?.toISOString() ?? null,
    metadata: subscription.metadata,
  };
};

export const convertToDatabaseProduct = (
  product: Product,
): Infer<typeof schema.tables.products.validator> => {
  return {
    id: product.id,
    organizationId: product.organizationId,
    name: product.name,
    description: product.description,
    isRecurring: product.isRecurring,
    isArchived: product.isArchived,
    createdAt: product.createdAt.toISOString(),
    modifiedAt: product.modifiedAt?.toISOString() ?? null,
    recurringInterval: product.recurringInterval,
    metadata: product.metadata,
    prices: product.prices.map((price) => ({
      id: price.id,
      productId: price.productId,
      amountType: price.amountType,
      isArchived: price.isArchived,
      createdAt: price.createdAt.toISOString(),
      modifiedAt: price.modifiedAt?.toISOString() ?? null,
      recurringInterval:
        price.type === "recurring"
          ? price.recurringInterval ?? undefined
          : undefined,
      priceAmount: price.amountType === "fixed" ? price.priceAmount : undefined,
      priceCurrency:
        price.amountType === "fixed" || price.amountType === "custom"
          ? price.priceCurrency
          : undefined,
      minimumAmount:
        price.amountType === "custom" ? price.minimumAmount : undefined,
      maximumAmount:
        price.amountType === "custom" ? price.maximumAmount : undefined,
      presetAmount:
        price.amountType === "custom" ? price.presetAmount : undefined,
      type: price.type,
    })),
    medias: product.medias.map((media) => ({
      id: media.id,
      organizationId: media.organizationId,
      name: media.name,
      path: media.path,
      mimeType: media.mimeType,
      size: media.size,
      storageVersion: media.storageVersion,
      checksumEtag: media.checksumEtag,
      checksumSha256Base64: media.checksumSha256Base64,
      checksumSha256Hex: media.checksumSha256Hex,
      createdAt: media.createdAt.toISOString(),
      lastModifiedAt: media.lastModifiedAt?.toISOString() ?? null,
      version: media.version,
      isUploaded: media.isUploaded,
      sizeReadable: media.sizeReadable,
      publicUrl: media.publicUrl,
    })),
  };
};

// ============= Input Validation Functions =============

/**
 * Validates a user ID string
 * @param userId - The user ID to validate
 * @returns true if valid, throws an error otherwise
 */
export function validateUserId(userId: unknown): asserts userId is string {
  if (typeof userId !== "string") {
    throw new Error("User ID must be a string");
  }
  if (userId.trim().length === 0) {
    throw new Error("User ID cannot be empty");
  }
  if (userId.length > 256) {
    throw new Error("User ID is too long (max 256 characters)");
  }
}

/**
 * Validates a product ID string
 * @param productId - The product ID to validate
 * @returns true if valid, throws an error otherwise
 */
export function validateProductId(productId: unknown): asserts productId is string {
  if (typeof productId !== "string") {
    throw new Error("Product ID must be a string");
  }
  if (productId.trim().length === 0) {
    throw new Error("Product ID cannot be empty");
  }
  if (productId.length > 256) {
    throw new Error("Product ID is too long (max 256 characters)");
  }
}

/**
 * Validates an array of product IDs
 * @param productIds - The array of product IDs to validate
 * @returns true if valid, throws an error otherwise
 */
export function validateProductIds(productIds: unknown): asserts productIds is string[] {
  if (!Array.isArray(productIds)) {
    throw new Error("Product IDs must be an array");
  }
  if (productIds.length === 0) {
    throw new Error("Product IDs array cannot be empty");
  }
  if (productIds.length > 100) {
    throw new Error("Too many product IDs (max 100)");
  }
  productIds.forEach((id, index) => {
    if (typeof id !== "string") {
      throw new Error(`Product ID at index ${index} must be a string`);
    }
    if (id.trim().length === 0) {
      throw new Error(`Product ID at index ${index} cannot be empty`);
    }
    if (id.length > 256) {
      throw new Error(`Product ID at index ${index} is too long (max 256 characters)`);
    }
  });
}

/**
 * Validates a subscription ID string
 * @param subscriptionId - The subscription ID to validate
 * @returns true if valid, throws an error otherwise
 */
export function validateSubscriptionId(subscriptionId: unknown): asserts subscriptionId is string {
  if (typeof subscriptionId !== "string") {
    throw new Error("Subscription ID must be a string");
  }
  if (subscriptionId.trim().length === 0) {
    throw new Error("Subscription ID cannot be empty");
  }
  if (subscriptionId.length > 256) {
    throw new Error("Subscription ID is too long (max 256 characters)");
  }
}

/**
 * Validates a customer ID string
 * @param customerId - The customer ID to validate
 * @returns true if valid, throws an error otherwise
 */
export function validateCustomerId(customerId: unknown): asserts customerId is string {
  if (typeof customerId !== "string") {
    throw new Error("Customer ID must be a string");
  }
  if (customerId.trim().length === 0) {
    throw new Error("Customer ID cannot be empty");
  }
  if (customerId.length > 256) {
    throw new Error("Customer ID is too long (max 256 characters)");
  }
}

/**
 * Validates a Polar organization token
 * @param token - The Polar organization token to validate
 * @returns true if valid, throws an error otherwise
 */
export function validatePolarToken(token: unknown): asserts token is string {
  if (typeof token !== "string") {
    throw new Error("Polar token must be a string");
  }
  if (token.trim().length === 0) {
    throw new Error("Polar token cannot be empty");
  }
  if (token.length < 10) {
    throw new Error("Polar token seems invalid (too short)");
  }
}

/**
 * Validates metadata object (should be a record with string keys and JSON-serializable values)
 * @param metadata - The metadata object to validate
 * @returns true if valid, throws an error otherwise
 */
export function validateMetadata(metadata: unknown): asserts metadata is Record<string, unknown> {
  if (typeof metadata !== "object" || metadata === null) {
    throw new Error("Metadata must be an object");
  }
  if (Array.isArray(metadata)) {
    throw new Error("Metadata must be an object, not an array");
  }
  
  const obj = metadata as Record<string, unknown>;
  const keys = Object.keys(obj);
  
  if (keys.length > 1000) {
    throw new Error("Metadata has too many properties (max 1000)");
  }

  for (const [key, value] of Object.entries(obj)) {
    if (typeof key !== "string") {
      throw new Error("Metadata keys must be strings");
    }
    if (key.length > 256) {
      throw new Error(`Metadata key "${key}" is too long (max 256 characters)`);
    }
    if (
      typeof value !== "string" &&
      typeof value !== "number" &&
      typeof value !== "boolean" &&
      value !== null &&
      typeof value !== "object"
    ) {
      throw new Error(`Metadata value for key "${key}" is not JSON-serializable`);
    }
  }
}

