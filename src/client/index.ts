import "./polyfill";
import {
  FunctionReference,
  type HttpRouter,
  WithoutSystemFields,
  createFunctionHandle,
  httpActionGeneric,
} from "convex/server";
import {
  type ComponentApi,
  convertToDatabaseProduct,
  convertToDatabaseSubscription,
  RunMutationCtx,
  RunQueryCtx,
} from "../component/util";
import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import {
  WebhookSubscriptionCreatedPayload,
  WebhookSubscriptionUpdatedPayload,
  WebhookProductCreatedPayload,
  WebhookProductUpdatedPayload,
} from "@polar-sh/sdk/models/components";
import { Doc } from "../component/_generated/dataModel";
import { Infer } from "convex/values";
import schema from "../component/schema";

export const subscriptionValidator = schema.tables.subscriptions.validator;
export type Subscription = Infer<typeof subscriptionValidator>;

export type SubscriptionHandler = FunctionReference<
  "mutation",
  "internal",
  { subscription: Subscription }
>;

export class Polar {
  public onScheduleCreated?: SubscriptionHandler;
  constructor(
    public component: ComponentApi,
    options: {
      onScheduleCreated?: FunctionReference<
        "mutation",
        "internal",
        { subscription: WithoutSystemFields<Doc<"subscriptions">> }
      >;
    } = {}
  ) {
    this.onScheduleCreated = options.onScheduleCreated;
  }
  listProducts(
    ctx: RunQueryCtx,
    { includeArchived }: { includeArchived: boolean }
  ) {
    return ctx.runQuery(this.component.lib.listProducts, { includeArchived });
  }
  listUserSubscriptions(ctx: RunQueryCtx, { userId }: { userId: string }) {
    return ctx.runQuery(this.component.lib.listUserSubscriptions, { userId });
  }
  getSubscription(ctx: RunQueryCtx, { id }: { id: string }) {
    return ctx.runQuery(this.component.lib.getSubscription, { id });
  }
  getProduct(ctx: RunQueryCtx, { id }: { id: string }) {
    return ctx.runQuery(this.component.lib.getProduct, { id });
  }
  registerRoutes(
    http: HttpRouter,
    {
      path = "/polar/events",
    }: {
      path?: string;
      onSubscriptionCreated?: (
        ctx: RunMutationCtx,
        event: WebhookSubscriptionCreatedPayload
      ) => Promise<void>;
      onSubscriptionUpdated?: (
        ctx: RunMutationCtx,
        event: WebhookSubscriptionUpdatedPayload
      ) => Promise<void>;
      onProductCreated?: (
        ctx: RunMutationCtx,
        event: WebhookProductCreatedPayload
      ) => Promise<void>;
      onProductUpdated?: (
        ctx: RunMutationCtx,
        event: WebhookProductUpdatedPayload
      ) => Promise<void>;
    } = {}
  ) {
    http.route({
      path,
      method: "POST",
      handler: httpActionGeneric(async (ctx, request) => {
        if (!request.body) {
          throw new Error("No body");
        }
        const body = await request.text();
        const headers = Object.fromEntries(request.headers.entries());
        try {
          const event = validateEvent(
            body,
            headers,
            process.env["POLAR_WEBHOOK_SECRET"] ?? ""
          );
          switch (event.type) {
            case "subscription.created": {
              await ctx.runMutation(this.component.lib.createSubscription, {
                subscription: convertToDatabaseSubscription(event.data),
                callback:
                  this.onScheduleCreated &&
                  (await createFunctionHandle(this.onScheduleCreated)),
              });
              break;
            }
            case "subscription.updated": {
              await ctx.runMutation(this.component.lib.updateSubscription, {
                subscription: convertToDatabaseSubscription(event.data),
              });
              break;
            }
            case "product.created":
            case "product.updated": {
              await ctx.runMutation(this.component.lib.updateProduct, {
                product: convertToDatabaseProduct(event.data),
              });
              break;
            }
          }
          return new Response("Accepted", { status: 202 });
        } catch (error) {
          if (error instanceof WebhookVerificationError) {
            console.error(error);
            return new Response("Forbidden", { status: 403 });
          }
          throw error;
        }
      }),
    });
  }
}
