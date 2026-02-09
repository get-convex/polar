import { PolarCore } from "@polar-sh/sdk/core.js";
import { benefitsCreate } from "@polar-sh/sdk/funcs/benefitsCreate.js";
import { metersCreate } from "@polar-sh/sdk/funcs/metersCreate.js";
import { productsCreate } from "@polar-sh/sdk/funcs/productsCreate.js";
import { productsList } from "@polar-sh/sdk/funcs/productsList.js";
import { productsUpdate } from "@polar-sh/sdk/funcs/productsUpdate.js";
import { productsUpdateBenefits } from "@polar-sh/sdk/funcs/productsUpdateBenefits.js";
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
export const TEAM_PLAN_NAME = "Team Plan";
export const API_PLAN_NAME = "API Plan";

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

    const premiumYearly = await productsCreate(polar, {
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

    const premiumPlusMonthly = await productsCreate(polar, {
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

    const premiumPlusYearly = await productsCreate(polar, {
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

    // Team Plan — seat-based pricing
    await productsCreate(polar, {
      name: TEAM_PLAN_NAME,
      description: "Per-seat pricing for your team with volume discounts.",
      recurringInterval: "month",
      prices: [
        {
          amountType: "seat_based",
          seatTiers: {
            tiers: [
              { minSeats: 1, maxSeats: 5, pricePerSeat: 1000 },
              { minSeats: 6, maxSeats: 20, pricePerSeat: 900 },
              { minSeats: 21, maxSeats: null, pricePerSeat: 800 },
            ],
          },
        },
      ],
    });

    // API Plan — metered usage pricing
    const meter = await metersCreate(polar, {
      name: "API Requests",
      filter: {
        conjunction: "and",
        clauses: [
          { property: "type", operator: "eq", value: "api_request" },
        ],
      },
      aggregation: { func: "count" },
    });
    if (!meter.ok) {
      console.error("Failed to create meter:", meter.error);
    } else {
      await productsCreate(polar, {
        name: API_PLAN_NAME,
        description:
          "Pay per API request with a monthly cap. Usage tracked automatically.",
        recurringInterval: "month",
        prices: [
          {
            amountType: "metered_unit",
            meterId: meter.value.id,
            unitAmount: 1,
            capAmount: 5000,
          },
        ],
      });
    }

    // Create benefits and attach to Premium products
    const prioritySupport = await benefitsCreate(polar, {
      type: "custom",
      description: "Priority support",
      properties: { note: "Get responses within 24 hours" },
    });
    const earlyAccess = await benefitsCreate(polar, {
      type: "custom",
      description: "Early access to new features",
      properties: { note: "Beta access to upcoming features" },
    });

    if (prioritySupport.ok && earlyAccess.ok) {
      const benefitIds = [prioritySupport.value.id, earlyAccess.value.id];

      // Attach benefits to all Premium products
      const premiumProductIds = [
        premiumMonthly.ok ? premiumMonthly.value.id : undefined,
        premiumYearly.ok ? premiumYearly.value.id : undefined,
        premiumPlusMonthly.ok ? premiumPlusMonthly.value.id : undefined,
        premiumPlusYearly.ok ? premiumPlusYearly.value.id : undefined,
      ];
      for (const productId of premiumProductIds) {
        if (productId) {
          await productsUpdateBenefits(polar, {
            id: productId,
            productBenefitsUpdate: { benefits: benefitIds },
          });
        }
      }
      console.log("Benefits attached to Premium products");
    }
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
