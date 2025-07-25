import { PolarCore } from "@polar-sh/sdk/core.js";
import { productsCreate } from "@polar-sh/sdk/funcs/productsCreate.js";
import { productsList } from "@polar-sh/sdk/funcs/productsList.js";
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

const accessToken = process.env.POLAR_ORGANIZATION_TOKEN;

const polar = new PolarCore({
  accessToken,
  server: "sandbox",
});

export const PREMIUM_PLAN_NAME = "Premium Plan";
export const PREMIUM_PLUS_PLAN_NAME = "Premium Plus Plan";

export const insertFakeUser = internalMutation({
  handler: async (ctx) => {
    const existingUser = await ctx.db.query("users").first();
    if (existingUser) {
      console.log("User already exists");
      return;
    }
    await ctx.db.insert("users", { email: "user@example.com" });
  },
});

const seed = internalAction({
  handler: async (ctx) => {
    // Insert a fake user for test purposes since this example doesn't have
    // working authentication.
    await ctx.runMutation(internal.seed.insertFakeUser);

    async function hasItems(asyncIterable: AsyncIterable<any>) {
      for await (const {
        result: { items },
      } of asyncIterable) {
        return items.length > 0;
      }
    }
    const result = await productsList(polar, {
      isArchived: false,
      limit: 1,
    });
    const hasProducts = await hasItems(result);

    // Return early if the Polar organization already has products, ensures
    // this doesn't run more than once.
    if (hasProducts) {
      console.log("Products already exist");
      return;
    }

    // Create example products. In a real app you would likely create your
    // products in the Polar dashboard and reference them by id in your application.
    await Promise.all([
      productsCreate(polar, {
        name: PREMIUM_PLAN_NAME,
        description: "All the things for one low monthly price.",
        recurringInterval: "month",
        prices: [
          {
            amountType: "fixed",
            priceAmount: 1000,
          },
        ],
      }),
      productsCreate(polar, {
        name: PREMIUM_PLAN_NAME,
        description: "All the things for one low annual price.",
        recurringInterval: "year",
        prices: [
          {
            amountType: "fixed",
            priceAmount: 10000,
          },
        ],
      }),
      productsCreate(polar, {
        name: PREMIUM_PLUS_PLAN_NAME,
        description: "All the things for one low monthly price.",
        recurringInterval: "month",
        prices: [
          {
            amountType: "fixed",
            priceAmount: 2000,
          },
        ],
      }),
      productsCreate(polar, {
        name: PREMIUM_PLUS_PLAN_NAME,
        description: "All the things for one low annual price.",
        recurringInterval: "year",
        prices: [
          {
            amountType: "fixed",
            priceAmount: 20000,
          },
        ],
      }),
    ]);
  },
});

export default seed;
