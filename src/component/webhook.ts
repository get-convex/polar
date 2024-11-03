import { type GenericActionCtx, type GenericDataModel } from "convex/server";

import {
  type WebhookSubscriptionCreatedPayload,
  type WebhookSubscriptionCreatedPayload$Outbound,
  WebhookSubscriptionCreatedPayload$inboundSchema as WebhookSubscriptionCreatedPayloadSchema,
} from "@polar-sh/sdk/models/components/webhooksubscriptioncreatedpayload";
import {
  type WebhookSubscriptionUpdatedPayload,
  type WebhookSubscriptionUpdatedPayload$Outbound,
  WebhookSubscriptionUpdatedPayload$inboundSchema as WebhookSubscriptionUpdatedPayloadSchema,
} from "@polar-sh/sdk/models/components/webhooksubscriptionupdatedpayload";
import { Webhook } from "standardwebhooks";
import type { Doc } from "../component/_generated/dataModel";
import {
  sendSubscriptionErrorEmail,
  sendSubscriptionSuccessEmail,
} from "../component/email/templates/subscriptionEmail";
import { ComponentApi } from "./util";

const handleUpdateSubscription = async (
  component: ComponentApi,
  ctx: GenericActionCtx<GenericDataModel>,
  user: Doc<"users">,
  subscription:
    | WebhookSubscriptionCreatedPayload
    | WebhookSubscriptionUpdatedPayload
) => {
  const subscriptionItem = subscription.data;
  await ctx.runMutation(component.lib.replaceSubscription, {
    localUserId: user._id,
    subscriptionPolarId: subscription.data.id,
    input: {
      productId: subscriptionItem.productId,
      priceId: subscriptionItem.priceId,
      interval: subscriptionItem.recurringInterval,
      status: subscriptionItem.status,
      currency: "usd",
      currentPeriodStart: subscriptionItem.currentPeriodStart.getTime(),
      currentPeriodEnd: subscriptionItem.currentPeriodEnd?.getTime(),
      cancelAtPeriodEnd: subscriptionItem.cancelAtPeriodEnd,
    },
  });
};

const handleSubscriptionChange = async (
  component: ComponentApi,
  ctx: GenericActionCtx<GenericDataModel>,
  event: WebhookSubscriptionCreatedPayload | WebhookSubscriptionUpdatedPayload
) => {
  const userId = event.data.metadata.userId;
  const email = event.data.user.email;
  const user = await ctx.runQuery(component.lib.getUserByLocalId, {
    localUserId: userId,
  });
  if (!user) {
    throw new Error("User not found");
  }
  await handleUpdateSubscription(component, ctx, user, event);

  const freePlan = await ctx.runQuery(component.lib.getPlanByKey, {
    key: "free",
  });

  // Only send email for paid plans
  if (event.data.productId !== freePlan?.polarProductId) {
    await sendSubscriptionSuccessEmail({
      email,
      subscriptionId: event.data.id,
    });
  }

  return new Response(null);
};

const handlePolarSubscriptionUpdatedError = async (
  component: ComponentApi,
  ctx: GenericActionCtx<GenericDataModel>,
  event: WebhookSubscriptionCreatedPayload | WebhookSubscriptionUpdatedPayload
) => {
  const userId = event.data.metadata.userId;
  const email = event.data.user.email;
  const subscription = event.data;

  const user = await ctx.runQuery(component.lib.getUserByLocalId, {
    localUserId: userId,
  });
  if (!user) throw new Error("User not found");

  const freePlan = await ctx.runQuery(component.lib.getPlanByKey, {
    key: "free",
  });

  // Only send email for paid plans
  if (event.data.productId !== freePlan?.polarProductId) {
    await sendSubscriptionErrorEmail({
      email,
      subscriptionId: subscription.id,
    });
  }
  return new Response(null);
};
export const handleWebhook = async (
  component: ComponentApi,
  ctx: GenericActionCtx<GenericDataModel>,
  request: Request
) => {
  if (!request.body) {
    return new Response(null, { status: 400 });
  }

  const wh = new Webhook(btoa(process.env.POLAR_WEBHOOK_SECRET!));
  const body = await request.text();
  const event = wh.verify(
    body,
    Object.fromEntries(request.headers.entries())
  ) as
    | WebhookSubscriptionCreatedPayload$Outbound
    | WebhookSubscriptionUpdatedPayload$Outbound
    | { type: string };

  console.log("event", event);
  try {
    switch (event.type) {
      /**
       * Occurs when a subscription has been created.
       */
      case "subscription.created": {
        return handleSubscriptionChange(
          component,
          ctx,
          WebhookSubscriptionCreatedPayloadSchema.parse(event)
        );
      }

      /**
       * Occurs when a subscription has been updated.
       * E.g. when a user upgrades or downgrades their plan.
       */
      case "subscription.updated": {
        return handleSubscriptionChange(
          component,
          ctx,
          WebhookSubscriptionUpdatedPayloadSchema.parse(event)
        );
      }
    }
  } catch {
    switch (event.type) {
      case "subscription.created": {
        return handlePolarSubscriptionUpdatedError(
          component,
          ctx,
          WebhookSubscriptionCreatedPayloadSchema.parse(event)
        );
      }

      case "subscription.updated": {
        return handlePolarSubscriptionUpdatedError(
          component,
          ctx,
          WebhookSubscriptionUpdatedPayloadSchema.parse(event)
        );
      }
    }
  }
  return new Response("OK", { status: 200 });
};
