import {
  Expand,
  FunctionReference,
  GenericActionCtx,
  GenericDataModel,
  GenericMutationCtx,
  GenericQueryCtx,
  httpActionGeneric,
  HttpRouter,
} from "convex/server";
import { GenericId } from "convex/values";
import { Mounts } from "../component/_generated/api";

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
import { api, internal } from "../component/_generated/api";
import type { Doc } from "../component/_generated/dataModel";
import {
  sendSubscriptionErrorEmail,
  sendSubscriptionSuccessEmail,
} from "../component/email/templates/subscriptionEmail";

const handleUpdateSubscription = async (
  ctx: GenericActionCtx<GenericDataModel>,
  user: Doc<"users">,
  subscription:
    | WebhookSubscriptionCreatedPayload
    | WebhookSubscriptionUpdatedPayload
) => {
  const subscriptionItem = subscription.data;
  await ctx.runMutation(internal.lib.replaceSubscription, {
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
  const user = await ctx.runQuery(component.lib.getUser, {
    userId,
  });
  if (!user) {
    throw new Error("User not found");
  }
  await handleUpdateSubscription(ctx, user, event);

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

  const user = await ctx.runQuery(api.lib.getUser, {
    userId,
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

export class Polar {
  constructor(public component: UseApi<typeof api>) {}

  async getUserSubscription(ctx: RunQueryCtx, userId: string) {
    const user = await ctx.runQuery(this.component.lib.getUser, { userId });
    return user?.subscription;
  }

  async deleteUserSubscription(ctx: RunMutationCtx, userId: string) {
    return ctx.runMutation(this.component.lib.deleteUserSubscription, {
      userId,
    });
  }

  async getOnboardingCheckoutUrl(
    ctx: RunActionCtx,
    {
      successUrl,
      userId,
      userEmail,
    }: {
      successUrl: string;
      userId: string;
      userEmail?: string;
    }
  ) {
    return ctx.runAction(this.component.lib.getOnboardingCheckoutUrl, {
      successUrl,
      userId,
      userEmail,
    });
  }

  async setSubscriptionPending(ctx: RunMutationCtx, userId: string) {
    return ctx.runMutation(this.component.lib.setSubscriptionPending, {
      localUserId: userId,
    });
  }

  registerRoutes(http: HttpRouter) {
    http.route({
      path: "/polar/message-status",
      method: "POST",
      handler: httpActionGeneric(async (ctx, request) => {
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
          | WebhookSubscriptionUpdatedPayload$Outbound;

        try {
          switch (event.type) {
            /**
             * Occurs when a subscription has been created.
             */
            case "subscription.created": {
              return handleSubscriptionChange(
                this.component,
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
                this.component,
                ctx,
                WebhookSubscriptionUpdatedPayloadSchema.parse(event)
              );
            }
          }
        } catch {
          switch (event.type) {
            case "subscription.created": {
              return handlePolarSubscriptionUpdatedError(
                this.component,
                ctx,
                WebhookSubscriptionCreatedPayloadSchema.parse(event)
              );
            }

            case "subscription.updated": {
              return handlePolarSubscriptionUpdatedError(
                this.component,
                ctx,
                WebhookSubscriptionUpdatedPayloadSchema.parse(event)
              );
            }
          }
        }
      }),
    });
  }
  /*
  async add<Name extends string = keyof Shards & string>(
    ctx: RunMutationCtx,
    name: Name,
    count: number = 1
  ) {
    const shards = this.options?.shards?.[name] ?? this.options?.defaultShards;
    return ctx.runMutation(this.component.lib.add, {
      name,
      count,
      shards,
    });
  }
  async count<Name extends string = keyof Shards & string>(
    ctx: RunQueryCtx,
    name: Name
  ) {
    return ctx.runQuery(this.component.lib.count, { name });
  }
  // Another way of exporting functionality
  for<Name extends string = keyof Shards & string>(name: Name) {
    return {
      add: async (ctx: RunMutationCtx, count: number = 1) =>
        this.add(ctx, name, count),
      subtract: async (ctx: RunMutationCtx, count: number = 1) =>
        this.add(ctx, name, -count),
      inc: async (ctx: RunMutationCtx) => this.add(ctx, name, 1),
      dec: async (ctx: RunMutationCtx) => this.add(ctx, name, -1),
      count: async (ctx: RunQueryCtx) => this.count(ctx, name),
    };
  }
  */
}

/* Type utils follow */

type RunQueryCtx = {
  runQuery: GenericQueryCtx<GenericDataModel>["runQuery"];
};
type RunMutationCtx = {
  runMutation: GenericMutationCtx<GenericDataModel>["runMutation"];
};
type RunActionCtx = {
  runAction: GenericActionCtx<GenericDataModel>["runAction"];
};

export type OpaqueIds<T> =
  T extends GenericId<infer _T>
    ? string
    : T extends (infer U)[]
      ? OpaqueIds<U>[]
      : T extends object
        ? { [K in keyof T]: OpaqueIds<T[K]> }
        : T;

export type UseApi<API> = Expand<{
  [mod in keyof API]: API[mod] extends FunctionReference<
    infer FType,
    "public",
    infer FArgs,
    infer FReturnType,
    infer FComponentPath
  >
    ? FunctionReference<
        FType,
        "internal",
        OpaqueIds<FArgs>,
        OpaqueIds<FReturnType>,
        FComponentPath
      >
    : UseApi<API[mod]>;
}>;

export type ComponentApi = UseApi<Mounts>;
