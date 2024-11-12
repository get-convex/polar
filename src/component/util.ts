import { GenericQueryCtx, WithoutSystemFields } from "convex/server";
import { Expand, FunctionReference } from "convex/server";

import { GenericMutationCtx } from "convex/server";
import { GenericDataModel } from "convex/server";
import { GenericActionCtx } from "convex/server";
import { GenericId } from "convex/values";
import { Mounts } from "./_generated/api";
import {
  Benefit,
  BenefitGrant,
  Order,
  Product,
  Subscription,
} from "@polar-sh/sdk/models/components";
import { Doc } from "./_generated/dataModel";

export type RunQueryCtx = {
  runQuery: GenericQueryCtx<GenericDataModel>["runQuery"];
};
export type RunMutationCtx = {
  runMutation: GenericMutationCtx<GenericDataModel>["runMutation"];
};
export type RunActionCtx = {
  runAction: GenericActionCtx<GenericDataModel>["runAction"];
};

export type OpaqueIds<T> =
  T extends GenericId<infer _T>
    ? string
    : T extends (infer U)[]
      ? OpaqueIds<U>[]
      : T extends object
        ? { [K in keyof T]: OpaqueIds<T[K]> }
        : T;

export type UseApi<API> = Expand<{
  [mod in keyof API]: API[mod] extends FunctionReference<
    infer FType,
    "public",
    infer FArgs,
    infer FReturnType,
    infer FComponentPath
  >
    ? FunctionReference<
        FType,
        "internal",
        OpaqueIds<FArgs>,
        OpaqueIds<FReturnType>,
        FComponentPath
      >
    : UseApi<API[mod]>;
}>;

export type ComponentApi = UseApi<Mounts>;

export const convertToDatabaseOrder = (
  order: Order
): WithoutSystemFields<Doc<"orders">> => {
  return {
    id: order.id,
    userId: order.userId,
    productId: order.productId,
    productPriceId: order.productPriceId,
    subscriptionId: order.subscriptionId,
    checkoutId: order.checkoutId,
    createdAt: order.createdAt.toISOString(),
    modifiedAt: order.modifiedAt?.toISOString() ?? null,
    metadata: order.metadata,
    amount: order.amount,
    taxAmount: order.taxAmount,
    currency: order.currency,
    billingReason: order.billingReason,
  };
};

export const convertToDatabaseSubscription = (
  subscription: Subscription
): WithoutSystemFields<Doc<"subscriptions">> => {
  return {
    id: subscription.id,
    createdAt: subscription.createdAt.toISOString(),
    modifiedAt: subscription.modifiedAt?.toISOString() ?? null,
    userId: subscription.userId,
    productId: subscription.productId,
    priceId: subscription.priceId,
    checkoutId: subscription.checkoutId,
    amount: subscription.amount,
    currency: subscription.currency,
    recurringInterval: subscription.recurringInterval,
    status: subscription.status,
    currentPeriodStart: subscription.currentPeriodStart.toISOString(),
    currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    startedAt: subscription.startedAt?.toISOString() ?? null,
    endedAt: subscription.endedAt?.toISOString() ?? null,
    metadata: subscription.metadata,
  };
};

export const convertToDatabaseProduct = (
  product: Product
): WithoutSystemFields<Doc<"products">> => {
  return {
    id: product.id,
    organizationId: product.organizationId,
    name: product.name,
    description: product.description,
    isRecurring: product.isRecurring,
    isArchived: product.isArchived,
    createdAt: product.createdAt.toISOString(),
    modifiedAt: product.modifiedAt?.toISOString() ?? null,
    prices: product.prices.map((price) => ({
      id: price.id,
      productId: price.productId,
      amountType: price.amountType,
      isArchived: price.isArchived,
      createdAt: price.createdAt.toISOString(),
      modifiedAt: price.modifiedAt?.toISOString() ?? null,
      recurringInterval:
        price.type === "recurring" ? price.recurringInterval : undefined,
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

export const convertToDatabaseBenefit = (
  benefit: Benefit
): WithoutSystemFields<Doc<"benefits">> => {
  return {
    id: benefit.id,
    organizationId: benefit.organizationId,
    description: benefit.description,
    selectable: benefit.selectable,
    deletable: benefit.deletable,
    properties: benefit.properties,
    createdAt: benefit.createdAt.toISOString(),
    modifiedAt: benefit.modifiedAt?.toISOString() ?? null,
    type: benefit.type,
  };
};

export const convertToDatabaseBenefitGrant = (
  benefitGrant: BenefitGrant
): WithoutSystemFields<Doc<"benefitGrants">> => {
  return {
    id: benefitGrant.id,
    userId: benefitGrant.userId,
    benefitId: benefitGrant.benefitId,
    properties: benefitGrant.properties,
    isGranted: benefitGrant.isGranted,
    isRevoked: benefitGrant.isRevoked,
    subscriptionId: benefitGrant.subscriptionId,
    orderId: benefitGrant.orderId,
    createdAt: benefitGrant.createdAt.toISOString(),
    modifiedAt: benefitGrant.modifiedAt?.toISOString() ?? null,
    grantedAt: benefitGrant.grantedAt?.toISOString() ?? null,
    revokedAt: benefitGrant.revokedAt?.toISOString() ?? null,
  };
};
