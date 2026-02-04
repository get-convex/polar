import { PolarCore } from "@polar-sh/sdk/core.js";
import { productsCreate } from "@polar-sh/sdk/funcs/productsCreate.js";
import { productsList } from "@polar-sh/sdk/funcs/productsList.js";
import { productsUpdate } from "@polar-sh/sdk/funcs/productsUpdate.js";
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

const accessToken = process.env.POLAR_ORGANIZATION_TOKEN;

const polar = new PolarCore({
  accessToken,
  server: "sandbox",
});

export const PREMIUM_PLAN_NAME = "Premium Plan";
export const PREMIUM_PLUS_PLAN_NAME = "Premium Plus Plan";
export const COMMUNITY_PLAN_NAME = "Community Plan";
export const SUPPORTER_PLAN_NAME = "Supporter Plan";

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

    const result = await productsList(polar, {
      isArchived: false,
      limit: 1,
    });
    let hasProducts = false;
    for await (const page of result) {
      if (page.ok) {
        hasProducts = page.value.result.items.length > 0;
        break;
      }
    }

    // Return early if the Polar organization already has products, ensures
    // this doesn't run more than once.
    if (hasProducts) {
      console.log("Products already exist");
      return;
    }

    // Create example products. In a real app you would likely create your
    // products in the Polar dashboard and reference them by id in your application.

    // Premium plans with trial support
    const premiumMonthly = await productsCreate(polar, {
      name: PREMIUM_PLAN_NAME,
      description: "All the things for one low monthly price.",
      recurringInterval: "month",
      trialInterval: "day",
      trialIntervalCount: 7,
      prices: [
        {
          amountType: "fixed",
          priceAmount: 1000,
        },
      ],
    });
    console.log("Created Premium Monthly:", premiumMonthly.value?.id);

    await productsCreate(polar, {
      name: PREMIUM_PLAN_NAME,
      description: "All the things for one low annual price.",
      recurringInterval: "year",
      prices: [
        {
          amountType: "fixed",
          priceAmount: 10000,
        },
      ],
    });

    await productsCreate(polar, {
      name: PREMIUM_PLUS_PLAN_NAME,
      description: "All the things for one low monthly price.",
      recurringInterval: "month",
      prices: [
        {
          amountType: "fixed",
          priceAmount: 2000,
        },
      ],
    });

    await productsCreate(polar, {
      name: PREMIUM_PLUS_PLAN_NAME,
      description: "All the things for one low annual price.",
      recurringInterval: "year",
      prices: [
        {
          amountType: "fixed",
          priceAmount: 20000,
        },
      ],
    });

    // Community Plan — free tier
    await productsCreate(polar, {
      name: COMMUNITY_PLAN_NAME,
      description: "Free access to the community. No credit card required.",
      recurringInterval: "month",
      prices: [
        {
          amountType: "free",
        },
      ],
    });

    // Supporter Plan — pay what you want
    await productsCreate(polar, {
      name: SUPPORTER_PLAN_NAME,
      description:
        "Support the project with a monthly contribution. Pay what you want.",
      recurringInterval: "month",
      prices: [
        {
          amountType: "custom",
          minimumAmount: 500,
          maximumAmount: 10000,
          presetAmount: 1000,
        },
      ],
    });
  },
});

// Utility action to archive all products so we can re-seed
export const archiveAll = internalAction({
  handler: async () => {
    const iter = await productsList(polar, { isArchived: false, limit: 50 });
    for await (const page of iter) {
      if (!page.ok) {
        console.error("Error listing products");
        return;
      }
      for (const product of page.value.result.items) {
        console.log("Archiving:", product.name, product.id);
        await productsUpdate(polar, {
          id: product.id,
          productUpdate: { isArchived: true },
        });
      }
    }
    console.log("All products archived");
  },
});

export default seed;
