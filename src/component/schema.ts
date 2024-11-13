import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const INTERVALS = {
  MONTH: "month",
  YEAR: "year",
} as const;
export const intervalValidator = v.union(
  v.literal(INTERVALS.MONTH),
  v.literal(INTERVALS.YEAR)
);

export default defineSchema(
  {
    benefits: defineTable({
      id: v.string(),
      createdAt: v.string(),
      modifiedAt: v.union(v.string(), v.null()),
      organizationId: v.string(),
      type: v.optional(v.string()),
      description: v.string(),
      selectable: v.boolean(),
      deletable: v.boolean(),
      properties: v.record(v.string(), v.any()),
    }).index("id", ["id"]),
    benefitGrants: defineTable({
      id: v.string(),
      createdAt: v.string(),
      modifiedAt: v.union(v.string(), v.null()),
      userId: v.string(),
      benefitId: v.string(),
      properties: v.record(v.string(), v.any()),
      isGranted: v.boolean(),
      isRevoked: v.boolean(),
      subscriptionId: v.union(v.string(), v.null()),
      orderId: v.union(v.string(), v.null()),
      grantedAt: v.union(v.string(), v.null()),
      revokedAt: v.union(v.string(), v.null()),
    })
      .index("id", ["id"])
      .index("userId", ["userId"]),
    orders: defineTable({
      id: v.string(),
      createdAt: v.string(),
      modifiedAt: v.union(v.string(), v.null()),
      userId: v.union(v.string(), v.null()),
      productId: v.union(v.string(), v.null()),
      productPriceId: v.string(),
      subscriptionId: v.union(v.string(), v.null()),
      checkoutId: v.union(v.string(), v.null()),
      metadata: v.record(v.string(), v.any()),
      amount: v.number(),
      taxAmount: v.number(),
      currency: v.string(),
      billingReason: v.string(),
    })
      .index("id", ["id"])
      .index("userId", ["userId"]),
    products: defineTable({
      id: v.string(),
      createdAt: v.string(),
      modifiedAt: v.union(v.string(), v.null()),
      name: v.string(),
      description: v.union(v.string(), v.null()),
      isRecurring: v.boolean(),
      isArchived: v.boolean(),
      organizationId: v.string(),
      prices: v.array(
        v.object({
          id: v.string(),
          createdAt: v.string(),
          modifiedAt: v.union(v.string(), v.null()),
          amountType: v.optional(v.string()),
          isArchived: v.boolean(),
          productId: v.string(),
          priceCurrency: v.optional(v.string()),
          priceAmount: v.optional(v.number()),
          type: v.optional(v.string()),
          recurringInterval: v.optional(v.string()),
        })
      ),
      medias: v.array(
        v.object({
          id: v.string(),
          organizationId: v.string(),
          name: v.string(),
          path: v.string(),
          mimeType: v.string(),
          size: v.number(),
          storageVersion: v.union(v.string(), v.null()),
          checksumEtag: v.union(v.string(), v.null()),
          checksumSha256Base64: v.union(v.string(), v.null()),
          checksumSha256Hex: v.union(v.string(), v.null()),
          createdAt: v.string(),
          lastModifiedAt: v.union(v.string(), v.null()),
          version: v.union(v.string(), v.null()),
          service: v.optional(v.string()),
          isUploaded: v.boolean(),
          sizeReadable: v.string(),
          publicUrl: v.string(),
        })
      ),
    })
      .index("id", ["id"])
      .index("isArchived", ["isArchived"]),
    subscriptions: defineTable({
      id: v.string(),
      createdAt: v.string(),
      modifiedAt: v.union(v.string(), v.null()),
      amount: v.union(v.number(), v.null()),
      currency: v.union(v.string(), v.null()),
      recurringInterval: v.string(),
      status: v.string(),
      currentPeriodStart: v.string(),
      currentPeriodEnd: v.union(v.string(), v.null()),
      cancelAtPeriodEnd: v.boolean(),
      startedAt: v.union(v.string(), v.null()),
      endedAt: v.union(v.string(), v.null()),
      userId: v.string(),
      productId: v.string(),
      priceId: v.string(),
      checkoutId: v.union(v.string(), v.null()),
      metadata: v.record(v.string(), v.any()),
    })
      .index("id", ["id"])
      .index("userId", ["userId"])
      .index("userId_status", ["userId", "status"]),
  },
  {
    schemaValidation: true,
  }
);
