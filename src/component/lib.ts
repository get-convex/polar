import { Polar } from "@polar-sh/sdk";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  action,
  internalMutation,
  mutation,
  query,
  QueryCtx,
} from "./_generated/server";
import schema from "./schema";

const createCheckout = async ({
  polarAccessToken,
  customerEmail,
  productPriceId,
  successUrl,
  polarSubscriptionId,
  localUserId,
}: {
  polarAccessToken: string;
  customerEmail?: string;
  productPriceId: string;
  successUrl: string;
  polarSubscriptionId?: string;
  localUserId: Id<"users">;
}) => {
  const polar = new Polar({
    server: "sandbox",
    accessToken: polarAccessToken,
  });
  if (polarSubscriptionId) {
    return polar.checkouts.create({
      productPriceId,
      successUrl,
      subscriptionId: polarSubscriptionId,
    });
  }
  return polar.checkouts.custom.create({
    productPriceId,
    successUrl,
    customerEmail,
    metadata: {
      userId: localUserId,
    },
  });
};

export const getPlanByKey = query({
  args: {
    key: schema.tables.plans.validator.fields.key,
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("plans")
      .withIndex("key", (q) => q.eq("key", args.key))
      .unique();
  },
});

export const createUser = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      userId: args.userId,
    });
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },
});

const getUser = async (ctx: QueryCtx, localUserId: Id<"users">) => {
  const user = await ctx.db.get(localUserId);
  if (!user) {
    return null;
  }
  const { subscriptionPendingId, ...subscriptionUser } = user;
  const subscription =
    (await ctx.db
      .query("subscriptions")
      .withIndex("localUserId", (q) => q.eq("localUserId", user._id))
      .unique()) || undefined;
  const plan = subscription ? await ctx.db.get(subscription.planId) : undefined;
  return {
    ...subscriptionUser,
    subscriptionIsPending: !!subscriptionPendingId,
    ...(subscription && {
      subscription: {
        ...subscription,
        plan,
      },
    }),
  };
};

const getUserQuery = query({
  args: {
    userId: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({
      ...schema.tables.users.validator.fields,
      subscriptionIsPending: v.optional(v.boolean()),
      subscription: v.optional(schema.tables.subscriptions.validator),
    })
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!user) {
      return null;
    }
    return getUser(ctx, user._id);
  },
});

export { getUserQuery as getUser };

export const getUserByLocalId = query({
  args: {
    localUserId: v.id("users"),
  },
  handler: async (ctx, args) => getUser(ctx, args.localUserId),
});

export const deleteUserSubscription = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!user) {
      throw new Error("User not found");
    }
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("localUserId", (q) => q.eq("localUserId", user._id))
      .unique();
    if (subscription) {
      await ctx.db.delete(subscription._id);
    }
  },
});

export const getOnboardingCheckoutUrl = action({
  args: {
    successUrl: v.string(),
    userId: v.string(),
    userEmail: v.optional(v.string()),
    polarAccessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const user =
      (await ctx.runQuery(api.lib.getUser, {
        userId: args.userId,
      })) ||
      (await ctx.runMutation(api.lib.createUser, {
        userId: args.userId,
      }));
    const product = await ctx.runQuery(api.lib.getPlanByKey, {
      key: "free",
    });
    const price = product?.prices.month?.usd;
    if (!price) {
      throw new Error("Price not found");
    }
    const checkout = await createCheckout({
      polarAccessToken: args.polarAccessToken,
      customerEmail: args.userEmail,
      productPriceId: price.polarId,
      successUrl: args.successUrl,
      localUserId: user?._id,
    });
    return checkout.url;
  },
});

export const getProOnboardingCheckoutUrl = action({
  args: {
    interval: schema.tables.subscriptions.validator.fields.interval,
    polarAccessToken: v.string(),
    successUrl: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.runQuery(api.lib.getPlanByKey, {
      key: "pro",
    });
    const price =
      args.interval === "month"
        ? product?.prices.month?.usd
        : product?.prices.year?.usd;
    if (!price) {
      throw new Error("Price not found");
    }
    const user = await ctx.runQuery(api.lib.getUser, {
      userId: args.userId,
    });
    if (!user) {
      throw new Error("User not found");
    }
    const checkout = await createCheckout({
      polarAccessToken: args.polarAccessToken,
      productPriceId: price.polarId,
      successUrl: args.successUrl,
      polarSubscriptionId: user?.subscription?.polarId,
      localUserId: user?._id,
    });
    return checkout.url;
  },
});

export const listPlans = query({
  args: {},
  handler: async (ctx) => {
    const plans = await ctx.db.query("plans").collect();
    return plans.sort((a, b) => a.key.localeCompare(b.key));
  },
});

export const replaceSubscription = mutation({
  args: {
    localUserId: v.id("users"),
    subscriptionPolarId: v.string(),
    input: v.object({
      currency: schema.tables.subscriptions.validator.fields.currency,
      productId: v.string(),
      priceId: v.string(),
      interval: schema.tables.subscriptions.validator.fields.interval,
      status: v.string(),
      currentPeriodStart: v.number(),
      currentPeriodEnd: v.optional(v.number()),
      cancelAtPeriodEnd: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("localUserId", (q) => q.eq("localUserId", args.localUserId))
      .unique();
    if (subscription) {
      await ctx.db.delete(subscription._id);
    }
    const plan = await ctx.db
      .query("plans")
      .withIndex("polarProductId", (q) =>
        q.eq("polarProductId", args.input.productId)
      )
      .unique();
    if (!plan) {
      throw new Error("Plan not found");
    }
    await ctx.db.insert("subscriptions", {
      localUserId: args.localUserId,
      planId: plan._id,
      polarId: args.subscriptionPolarId,
      polarPriceId: args.input.priceId,
      interval: args.input.interval,
      status: args.input.status,
      currency: args.input.currency,
      currentPeriodStart: args.input.currentPeriodStart,
      currentPeriodEnd: args.input.currentPeriodEnd,
      cancelAtPeriodEnd: args.input.cancelAtPeriodEnd,
    });
    const user = await ctx.db.get(args.localUserId);
    if (!user?.subscriptionPendingId) {
      return;
    }
    await ctx.scheduler.cancel(user.subscriptionPendingId);
    await ctx.db.patch(args.localUserId, {
      subscriptionPendingId: undefined,
    });
  },
});

export const setSubscriptionPending = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!user) {
      throw new Error("User not found");
    }
    const scheduledFunctionId = await ctx.scheduler.runAfter(
      1000 * 120,
      internal.lib.unsetSubscriptionPending,
      { localUserId: user._id }
    );
    await ctx.db.patch(user._id, {
      subscriptionPendingId: scheduledFunctionId,
    });
  },
});

export const unsetSubscriptionPending = internalMutation({
  args: {
    localUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.localUserId, {
      subscriptionPendingId: undefined,
    });
  },
});
