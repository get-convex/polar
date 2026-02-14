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
 * Shared helper for validating string IDs with consistent rules
 * @internal
 */
function validateStringId(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(`${label} must be a string`);
  }
  if (value.trim().length === 0) {
    throw new Error(`${label} cannot be empty`);
  }
  if (value.length > 256) {
    throw new Error(`${label} is too long (max 256 characters)`);
  }
}

/**
 * Validates a user ID string
 * @param userId - The user ID to validate
 * @throws {Error} if the input is invalid
 */
export function validateUserId(userId: unknown): asserts userId is string {
  validateStringId(userId, "User ID");
}

/**
 * Validates a product ID string
 * @param productId - The product ID to validate
 * @throws {Error} if the input is invalid
 */
export function validateProductId(productId: unknown): asserts productId is string {
  validateStringId(productId, "Product ID");
}

/**
 * Validates an array of product IDs
 * @param productIds - The array of product IDs to validate
 * @throws {Error} if the input is invalid
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
 * @throws {Error} if the input is invalid
 */
export function validateSubscriptionId(subscriptionId: unknown): asserts subscriptionId is string {
  validateStringId(subscriptionId, "Subscription ID");
}

/**
 * Validates a customer ID string
 * @param customerId - The customer ID to validate
 * @throws {Error} if the input is invalid
 */
export function validateCustomerId(customerId: unknown): asserts customerId is string {
  validateStringId(customerId, "Customer ID");
}

/**
 * Validates a Polar organization token
 * @param token - The Polar organization token to validate
 * @throws {Error} if the input is invalid
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
 * Performs deep validation to ensure nested values are JSON-serializable
 * @param metadata - The metadata object to validate
 * @throws {Error} if the input is invalid or contains non-serializable values
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
    if (key.length > 256) {
      throw new Error(`Metadata key "${key}" is too long (max 256 characters)`);
    }
    
    // Use a helper to check deep JSON serializability
    validateJsonSerializable(value, key);
  }
}

/**
 * Helper to recursively validate JSON serializability
 * @internal
 */
function validateJsonSerializable(value: unknown, keyPath: string): void {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return; // These types are always serializable
  }

  if (typeof value === "object") {
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        validateJsonSerializable(item, `${keyPath}[${index}]`);
      });
    } else {
      // Check for non-serializable object (functions, symbols, undefined, etc.)
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        if (typeof nestedValue === "function" || typeof nestedValue === "symbol") {
          throw new Error(
            `Metadata value for key "${keyPath}" is not JSON-serializable`
          );
        }
        if (typeof nestedValue === "object") {
          validateJsonSerializable(nestedValue, `${keyPath}.${nestedKey}`);
        }
      }
    }
    return;
  }

  // typeof value is "function" or "symbol" or "undefined"
  throw new Error(`Metadata value for key "${keyPath}" is not JSON-serializable`);
}

