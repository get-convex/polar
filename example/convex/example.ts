import { Polar } from "@convex-dev/polar";
import { v } from "convex/values";
import { WebhookSubscriptionCreatedPayload$inboundSchema } from "@polar-sh/sdk/models/components";
import { query, internalMutation } from "./_generated/server";
import { components } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const polarComponent = new Polar(components.polar);

export const listProducts = query({
  args: {},
  handler: async (ctx) => {
    return polarComponent.listProducts(ctx, {
      includeArchived: false,
    });
  },
});

export const getUserSubscriptions = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return polarComponent.listUserSubscriptions(ctx, args.userId);
  },
});

/**
 * This function is called when a Polar webhook is received.
 *
 * The payload is provided as received from Polar, and the webhook signature is
 * already verified before this function is called.
 */
export const polarEventCallback = internalMutation({
  args: {
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    switch (args.payload.type) {
      // When creating a subscription, pass the user's id from your system into
      // the metadata field. The same metadata will be passed back in the
      // webhook, allowing you to add the user's Polar ID to the record in
      // your database.
      case "subscription.created": {
        const payload = WebhookSubscriptionCreatedPayload$inboundSchema.parse(
          args.payload
        );
        const userId = payload.data.metadata.userId;
        await ctx.db.patch(userId as Id<"users">, {
          polarId: payload.data.userId,
        });
        break;
      }
    }
  },
});
