import { v, VString } from "convex/values";
import { mutation, query } from "./_generated/server";
import schema from "./schema";
import { asyncMap } from "convex-helpers";
import { FunctionHandle, WithoutSystemFields } from "convex/server";
import { Doc } from "./_generated/dataModel";

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

type Subscription = WithoutSystemFields<Doc<"subscriptions">>;
const subscriptionCallbackValidator = v.string() as VString<
  FunctionHandle<"mutation", { subscription: Subscription }>
>;

export const createSubscription = mutation({
  args: {
    subscription: schema.tables.subscriptions.validator,
    callback: v.optional(subscriptionCallbackValidator),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("subscriptions", args.subscription);
    if (args.callback) {
      await ctx.runMutation(args.callback, { subscription: args.subscription });
    }
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
    if (!existingSubscription) {
      throw new Error(`Subscription not found: ${args.subscription.id}`);
    }
    await ctx.db.patch(existingSubscription._id, args.subscription);
  },
});

export const createProduct = mutation({
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
    if (!existingProduct) {
      throw new Error(`Product not found: ${args.product.id}`);
    }
    await ctx.db.patch(existingProduct._id, args.product);
  },
});
