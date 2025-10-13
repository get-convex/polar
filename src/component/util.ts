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
    trialStart: subscription.trialStart?.toISOString() ?? null,
    trialEnd: subscription.trialEnd?.toISOString() ?? null,
    currentPeriodStart: subscription.currentPeriodStart.toISOString(),
    currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    customerCancellationReason: subscription.customerCancellationReason,
    customerCancellationComment: subscription.customerCancellationComment,
    startedAt: subscription.startedAt?.toISOString() ?? null,
    endedAt: subscription.endedAt?.toISOString() ?? null,
    metadata: subscription.metadata,
    discountId: subscription.discountId,
    canceledAt: subscription.canceledAt?.toISOString() ?? null,
    endsAt: subscription.endsAt?.toISOString() ?? null,
    recurringIntervalCount: subscription.recurringIntervalCount,
    trialStart: subscription.trialStart?.toISOString() ?? null,
    trialEnd: subscription.trialEnd?.toISOString() ?? null,
    seats: subscription.seats ?? null,
    customFieldData: subscription.customFieldData,
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
    trialInterval: product.trialInterval,
    trialIntervalCount: product.trialIntervalCount,
    recurringIntervalCount: product.recurringIntervalCount,
    prices: product.prices.map((price) => {
      const basePrice = {
        id: price.id,
        productId: price.productId,
        amountType: price.amountType,
        isArchived: price.isArchived,
        createdAt: price.createdAt.toISOString(),
        modifiedAt: price.modifiedAt?.toISOString() ?? null,
        recurringInterval: product.recurringInterval,
        type: product.isRecurring ? "recurring" : "one_time",
        source: price.source,
      };

      if (price.amountType === "fixed") {
        return {
          ...basePrice,
          priceAmount: price.priceAmount,
          priceCurrency: price.priceCurrency,
        };
      }

      if (price.amountType === "custom") {
        return {
          ...basePrice,
          priceCurrency: price.priceCurrency,
          minimumAmount: price.minimumAmount,
          maximumAmount: price.maximumAmount,
          presetAmount: price.presetAmount,
        };
      }

      if (price.amountType === "free") {
        return basePrice;
      }

      if (price.amountType === "seat_based") {
        return {
          ...basePrice,
          priceCurrency: price.priceCurrency,
          seatTiers: price.seatTiers?.tiers.map((tier) => ({
            minSeats: tier.minSeats,
            maxSeats: tier.maxSeats ?? null,
            pricePerSeat: tier.pricePerSeat,
          })),
        };
      }

      if (price.amountType === "metered_unit") {
        return {
          ...basePrice,
          priceCurrency: price.priceCurrency,
          unitAmount: price.unitAmount,
          capAmount: price.capAmount,
          meterId: price.meterId,
          meter: price.meter,
        };
      }

      return basePrice;
    }),
    benefits: product.benefits?.map((benefit) => ({
      id: benefit.id,
      createdAt: benefit.createdAt.toISOString(),
      modifiedAt: benefit.modifiedAt?.toISOString() ?? null,
      type: benefit.type,
      description: benefit.description,
      selectable: benefit.selectable,
      deletable: benefit.deletable,
      organizationId: benefit.organizationId,
      metadata: benefit.metadata,
      properties: benefit.properties,
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
