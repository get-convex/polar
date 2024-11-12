import { Polar } from "@polar-sh/sdk";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";
import schema from "./schema";
import { asyncMap } from "convex-helpers";
import { convertToDatabaseProduct } from "./util";

export const getSubscription = query({
  args: {
    id: v.id("subscriptions"),
  },
  returns: v.union(schema.tables.subscriptions.validator, v.null()),
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
  returns: v.union(schema.tables.orders.validator, v.null()),
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
  returns: v.union(schema.tables.products.validator, v.null()),
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
      product: v.optional(
        v.object({
          ...schema.tables.products.validator.fields,
          _id: v.id("products"),
          _creationTime: v.number(),
        })
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
              .unique()) || undefined
          : undefined;
        return {
          ...subscription,
          product,
        };
      }
    );
  },
});

export const listPlans = query({
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

export const insertOrder = mutation({
  args: {
    order: schema.tables.orders.validator,
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("orders", args.order);
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
    }
  },
});

export const insertSubscription = mutation({
  args: {
    subscription: schema.tables.subscriptions.validator,
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("subscriptions", args.subscription);
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
    }
  },
});

export const insertProduct = mutation({
  args: {
    product: schema.tables.products.validator,
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("products", args.product);
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
    }
  },
});

export const updateProducts = mutation({
  args: {
    polarAccessToken: v.string(),
    products: v.array(schema.tables.products.validator),
  },
  handler: async (ctx, args) => {
    await asyncMap(args.products, async (product) => {
      console.log(product);
      const existingProduct = await ctx.db
        .query("products")
        .withIndex("id", (q) => q.eq("id", product.id))
        .unique();
      if (existingProduct) {
        await ctx.db.patch(existingProduct._id, product);
        return;
      }
      await ctx.db.insert("products", product);
    });
  },
});

export const pullProducts = action({
  args: {
    polarAccessToken: v.string(),
    polarOrganizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const polar = new Polar({
      server: "sandbox",
      accessToken: args.polarAccessToken,
    });
    let page = 1;
    let maxPage;
    do {
      const products = await polar.products.list({
        page,
        limit: 10,
        organizationId: args.polarOrganizationId,
      });
      page = page + 1;
      maxPage = products.result.pagination.maxPage;
      await ctx.runMutation(api.lib.updateProducts, {
        polarAccessToken: args.polarAccessToken,
        products: products.result.items.map(convertToDatabaseProduct),
      });
    } while (maxPage >= page);
  },
});

export const insertBenefit = mutation({
  args: {
    benefit: schema.tables.benefits.validator,
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("benefits", args.benefit);
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
    }
  },
});

export const getBenefit = query({
  args: {
    id: v.id("benefits"),
  },
  returns: v.union(schema.tables.benefits.validator, v.null()),
  handler: async (ctx, args) => {
    return ctx.db
      .query("benefits")
      .withIndex("id", (q) => q.eq("id", args.id))
      .unique();
  },
});

export const listBenefits = query({
  returns: v.array(schema.tables.benefits.validator),
  handler: async (ctx, _args) => {
    return ctx.db.query("benefits").collect();
  },
});

export const insertBenefitGrant = mutation({
  args: {
    benefitGrant: schema.tables.benefitGrants.validator,
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("benefitGrants", args.benefitGrant);
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
    }
  },
});

export const getBenefitGrant = query({
  args: {
    id: v.id("benefitGrants"),
  },
  returns: v.union(schema.tables.benefitGrants.validator, v.null()),
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
  returns: v.array(schema.tables.benefitGrants.validator),
  handler: async (ctx, args) => {
    return ctx.db
      .query("benefitGrants")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});
