import { components } from "./_generated/api";
import { Polar } from "@convex-dev/polar";

const polar = new Polar(components.polar);

/*
export const addOne = mutation({
  args: {},
  handler: async (ctx, _args) => {
    await numUsers.inc(ctx);
  },
});

export const getCount = query({
  args: {},
  handler: async (ctx, _args) => {
    return await numUsers.count(ctx);
  },
});

export const usingClient = internalMutation({
  args: {},
  handler: async (ctx, _args) => {
    await polar.add(ctx, "accomplishments");
    await polar.add(ctx, "beans", 2);
    const count = await polar.count(ctx, "beans");
    return count;
  },
});

export const usingFunctions = internalMutation({
  args: {},
  handler: async (ctx, _args) => {
    await numUsers.inc(ctx);
    await numUsers.inc(ctx);
    await numUsers.dec(ctx);
    return numUsers.count(ctx);
  },
});

export const directCall = internalMutation({
  args: {},
  handler: async (ctx, _args) => {
    await ctx.runMutation(components.polar.lib.add, {
      name: "pennies",
      count: 250,
    });
    await ctx.runMutation(components.polar.lib.add, {
      name: "beans",
      count: 3,
      shards: 100,
    });
    const count = await ctx.runQuery(components.polar.lib.count, {
      name: "beans",
    });
    return count;
  },
});
*/
