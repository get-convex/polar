import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import schema from "./schema";
import { asyncMap } from "convex-helpers";

export const getSubscription = query({
  args: {
    id: v.id("subscriptions"),
  },
  returns: v.union(
    v.object({
      ...schema.tables.subscriptions.validator.fields,
      _id: v.id("subscriptions"),
      _creationTime: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return ctx.db
      .query("subscriptions")
      .withIndex("id", (q) => q.eq("id", args.id))
      .unique();
  },
});

export const getOrder = query({
  args: {
    id: v.id("orders"),
  },
  returns: v.union(
    v.object({
      ...schema.tables.orders.validator.fields,
      _id: v.id("orders"),
      _creationTime: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return ctx.db
      .query("orders")
      .withIndex("id", (q) => q.eq("id", args.id))
      .unique();
  },
});

export const getProduct = query({
  args: {
    id: v.id("products"),
  },
  returns: v.union(
    v.object({
      ...schema.tables.products.validator.fields,
      _id: v.id("products"),
      _creationTime: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return ctx.db
      .query("products")
      .withIndex("id", (q) => q.eq("id", args.id))
      .unique();
  },
});

export const listUserSubscriptions = query({
  args: {
    userId: v.string(),
  },
  returns: v.array(
    v.object({
      ...schema.tables.subscriptions.validator.fields,
      _id: v.id("subscriptions"),
      _creationTime: v.number(),
      product: v.union(
        v.object({
          ...schema.tables.products.validator.fields,
          _id: v.id("products"),
          _creationTime: v.number(),
        }),
        v.null()
      ),
    })
  ),
  handler: async (ctx, args) => {
    return asyncMap(
      ctx.db
        .query("subscriptions")
        .withIndex("userId", (q) => q.eq("userId", args.userId))
        .collect(),
      async (subscription) => {
        const product = subscription.productId
          ? (await ctx.db
              .query("products")
              .withIndex("id", (q) => q.eq("id", subscription.productId))
              .unique()) || null
          : null;
        return {
          ...subscription,
          product,
        };
      }
    );
  },
});

export const listProducts = query({
  args: {
    includeArchived: v.boolean(),
  },
  returns: v.array(
    v.object({
      ...schema.tables.products.validator.fields,
      _id: v.id("products"),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    if (args.includeArchived) {
      return ctx.db.query("products").collect();
    }
    return ctx.db
      .query("products")
      .withIndex("isArchived", (q) => q.lt("isArchived", true))
      .collect();
  },
});

export const updateOrder = mutation({
  args: {
    order: schema.tables.orders.validator,
  },
  handler: async (ctx, args) => {
    const existingOrder = await ctx.db
      .query("orders")
      .withIndex("id", (q) => q.eq("id", args.order.id))
      .unique();
    if (existingOrder) {
      await ctx.db.patch(existingOrder._id, args.order);
      return;
    }
    await ctx.db.insert("orders", args.order);
  },
});

export const updateSubscription = mutation({
  args: {
    subscription: schema.tables.subscriptions.validator,
  },
  handler: async (ctx, args) => {
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("id", (q) => q.eq("id", args.subscription.id))
      .unique();
    if (existingSubscription) {
      await ctx.db.patch(existingSubscription._id, args.subscription);
      return;
    }
    await ctx.db.insert("subscriptions", args.subscription);
  },
});

export const updateProduct = mutation({
  args: {
    product: schema.tables.products.validator,
  },
  handler: async (ctx, args) => {
    const existingProduct = await ctx.db
      .query("products")
      .withIndex("id", (q) => q.eq("id", args.product.id))
      .unique();
    if (existingProduct) {
      await ctx.db.patch(existingProduct._id, args.product);
      return;
    }
    await ctx.db.insert("products", args.product);
  },
});

export const updateBenefit = mutation({
  args: {
    benefit: schema.tables.benefits.validator,
  },
  handler: async (ctx, args) => {
    const existingBenefit = await ctx.db
      .query("benefits")
      .withIndex("id", (q) => q.eq("id", args.benefit.id))
      .unique();
    if (existingBenefit) {
      await ctx.db.patch(existingBenefit._id, args.benefit);
      return;
    }
    await ctx.db.insert("benefits", args.benefit);
  },
});

export const getBenefit = query({
  args: {
    id: v.id("benefits"),
  },
  returns: v.union(
    v.object({
      ...schema.tables.benefits.validator.fields,
      _id: v.id("benefits"),
      _creationTime: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return ctx.db
      .query("benefits")
      .withIndex("id", (q) => q.eq("id", args.id))
      .unique();
  },
});

export const listBenefits = query({
  args: {},
  returns: v.array(
    v.object({
      ...schema.tables.benefits.validator.fields,
      _id: v.id("benefits"),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx) => {
    return ctx.db.query("benefits").collect();
  },
});

export const updateBenefitGrant = mutation({
  args: {
    benefitGrant: schema.tables.benefitGrants.validator,
  },
  handler: async (ctx, args) => {
    const existingBenefitGrant = await ctx.db
      .query("benefitGrants")
      .withIndex("id", (q) => q.eq("id", args.benefitGrant.id))
      .unique();
    if (existingBenefitGrant) {
      await ctx.db.patch(existingBenefitGrant._id, args.benefitGrant);
      return;
    }
    await ctx.db.insert("benefitGrants", args.benefitGrant);
  },
});

export const getBenefitGrant = query({
  args: {
    id: v.id("benefitGrants"),
  },
  returns: v.union(
    v.object({
      ...schema.tables.benefitGrants.validator.fields,
      _id: v.id("benefitGrants"),
      _creationTime: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return ctx.db
      .query("benefitGrants")
      .withIndex("id", (q) => q.eq("id", args.id))
      .unique();
  },
});

export const listUserBenefitGrants = query({
  args: {
    userId: v.string(),
  },
  returns: v.array(
    v.object({
      ...schema.tables.benefitGrants.validator.fields,
      _id: v.id("benefitGrants"),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    return ctx.db
      .query("benefitGrants")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});
