import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const CURRENCIES = {
  USD: "usd",
  EUR: "eur",
} as const;
export const currencyValidator = v.union(
  v.literal(CURRENCIES.USD),
  v.literal(CURRENCIES.EUR)
);

export const INTERVALS = {
  MONTH: "month",
  YEAR: "year",
} as const;
export const intervalValidator = v.union(
  v.literal(INTERVALS.MONTH),
  v.literal(INTERVALS.YEAR)
);

const priceValidator = v.object({
  polarId: v.string(),
  amount: v.number(),
});
const pricesValidator = v.object({
  [CURRENCIES.USD]: v.optional(priceValidator),
  [CURRENCIES.EUR]: v.optional(priceValidator),
});

export const PLANS = {
  FREE: "free",
  PRO: "pro",
} as const;
export const planKeyValidator = v.union(
  v.literal(PLANS.FREE),
  v.literal(PLANS.PRO)
);

export type PlanKey = Infer<typeof planKeyValidator>;

export default defineSchema({
  users: defineTable({
    userId: v.optional(v.string()),
    polarId: v.string(),
    email: v.string(),
    polarSubscriptionPendingId: v.optional(v.id("_scheduled_functions")),
  })
    .index("userId", ["userId"])
    .index("polarId", ["polarId"]),
  plans: defineTable({
    key: planKeyValidator,
    polarProductId: v.string(),
    name: v.string(),
    description: v.string(),
    prices: v.object({
      [INTERVALS.MONTH]: v.optional(pricesValidator),
      [INTERVALS.YEAR]: v.optional(pricesValidator),
    }),
  })
    .index("key", ["key"])
    .index("polarProductId", ["polarProductId"]),
  subscriptions: defineTable({
    planId: v.id("plans"),
    polarId: v.string(),
    polarPriceId: v.string(),
    currency: currencyValidator,
    interval: intervalValidator,
    status: v.string(),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    userId: v.id("users"),
  })
    .index("userId", ["userId"])
    .index("polarId", ["polarId"]),
});
