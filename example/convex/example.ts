import { Polar } from "@convex-dev/polar";
import { api, components } from "./_generated/api";
import { QueryCtx, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const polar = new Polar(components.polar, {
  products: {
    // These would probably be environment variables in a production app
    premiumMonthly: "5fde8344-5fca-4d0b-adeb-2052cddfd9ed",
    premiumYearly: "9bc5ed5f-2065-40a4-bd1f-e012e448d82f",
    premiumPlusMonthly: "db548a6f-ff8c-4969-8f02-5f7301a36e7c",
    premiumPlusYearly: "9ff9976e-459e-4ebc-8cde-b2ced74f8822",
  },
  getUserInfo: async (ctx) => {
    const user: { _id: Id<"users">; email: string } = await ctx.runQuery(
      api.example.getCurrentUser
    );
    return {
      userId: user._id,
      email: user.email,
    };
  },
});

export const MAX_FREE_TODOS = 3;
export const MAX_PREMIUM_TODOS = 6;

export const {
  changeCurrentSubscription,
  cancelCurrentSubscription,
  getProducts,
} = polar.api();

export const { generateCheckoutLink, generateCustomerPortalUrl } =
  polar.checkoutApi();

// In a real app you'll set up authentication, we just use a
// fake user for the example.
const currentUser = async (ctx: QueryCtx) => {
  const user = await ctx.db.query("users").first();
  if (!user) {
    throw new Error("No user found");
  }
  const subscription = await polar.getCurrentSubscription(ctx, {
    userId: user._id,
  });
  const productKey = subscription?.productKey;
  const isPremium =
    productKey === "premiumMonthly" || productKey === "premiumYearly";
  const isPremiumPlus =
    productKey === "premiumPlusMonthly" || productKey === "premiumPlusYearly";
  return {
    ...user,
    isFree: !isPremium && !isPremiumPlus,
    isPremium,
    isPremiumPlus,
    subscription,
    maxTodos: isPremiumPlus
      ? MAX_PREMIUM_TODOS
      : isPremium
        ? MAX_PREMIUM_TODOS
        : MAX_FREE_TODOS,
  };
};

// Query that returns our pseudo user.
export const getCurrentUser = query({
  handler: async (ctx) => {
    return currentUser(ctx);
  },
});

/*
export const createCheckoutSession = action({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const user: Doc<"users"> = await ctx.runQuery(api.example.getCurrentUser);
    const session = await polar.createCheckoutSession(ctx, {
      productId: args.productId,
      userId: user._id,
      email: user.email,
    });
    return session.url;
  },
});
*/

export const authorizeTodo = async (ctx: QueryCtx, todoId: Id<"todos">) => {
  const user = await currentUser(ctx);
  const todo = await ctx.db.get(todoId);
  if (!todo || todo.userId !== user._id) {
    throw new Error("Todo not found");
  }
};

export const listTodos = query({
  handler: async (ctx) => {
    const user = await currentUser(ctx);
    return ctx.db
      .query("todos")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const insertTodo = mutation({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await currentUser(ctx);
    const todoCount = (
      await ctx.db
        .query("todos")
        .withIndex("userId", (q) => q.eq("userId", user._id))
        .collect()
    ).length;
    const productKey = user.subscription?.productKey;
    if (!productKey && todoCount >= MAX_FREE_TODOS) {
      throw new Error("Reached maximum number of todos for free plan");
    }
    if (
      (productKey === "premiumMonthly" ||
        productKey === "premiumPlusMonthly") &&
      todoCount >= MAX_PREMIUM_TODOS
    ) {
      throw new Error("Reached maximum number of todos for premium plan");
    }
    await ctx.db.insert("todos", {
      userId: user._id,
      text: args.text,
      completed: false,
    });
  },
});

export const updateTodoText = mutation({
  args: {
    todoId: v.id("todos"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    await authorizeTodo(ctx, args.todoId);
    await ctx.db.patch(args.todoId, { text: args.text });
  },
});

export const completeTodo = mutation({
  args: {
    todoId: v.id("todos"),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    await authorizeTodo(ctx, args.todoId);
    await ctx.db.patch(args.todoId, { completed: args.completed });
  },
});

export const deleteTodo = mutation({
  args: {
    todoId: v.id("todos"),
  },
  handler: async (ctx, args) => {
    await authorizeTodo(ctx, args.todoId);
    await ctx.db.delete(args.todoId);
  },
});
