import "./polyfill";
import {
  ApiFromModules,
  FunctionReference,
  GenericActionCtx,
  GenericDataModel,
  type HttpRouter,
  WithoutSystemFields,
  actionGeneric,
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
import { Polar as PolarSdk } from "@polar-sh/sdk";
import { Doc } from "../component/_generated/dataModel";
import { Infer, v } from "convex/values";
import schema from "../component/schema";
import { WebhookSubscriptionCreatedPayload } from "@polar-sh/sdk/models/components/webhooksubscriptioncreatedpayload.js";
import { WebhookSubscriptionUpdatedPayload } from "@polar-sh/sdk/models/components/webhooksubscriptionupdatedpayload.js";
import { WebhookProductCreatedPayload } from "@polar-sh/sdk/models/components/webhookproductcreatedpayload.js";
import { WebhookProductUpdatedPayload } from "@polar-sh/sdk/models/components/webhookproductupdatedpayload.js";
import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";

export const subscriptionValidator = schema.tables.subscriptions.validator;
export type Subscription = Infer<typeof subscriptionValidator>;

export type SubscriptionHandler = FunctionReference<
  "mutation",
  "internal",
  { subscription: Subscription }
>;

export type CheckoutApi<DataModel extends GenericDataModel> = ApiFromModules<{
  checkout: ReturnType<Polar<DataModel>["checkoutApi"]>;
}>["checkout"];

export class Polar<DataModel extends GenericDataModel> {
  private polar: PolarSdk;
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
    this.polar = new PolarSdk({
      accessToken: process.env["POLAR_ORGANIZATION_TOKEN"] ?? "",
      server:
        (process.env["POLAR_SERVER"] as "sandbox" | "production") ?? "sandbox",
    });
    this.onScheduleCreated = options.onScheduleCreated;
  }
  getCustomerByUserId(ctx: RunQueryCtx, userId: string) {
    return ctx.runQuery(this.component.lib.getCustomerByUserId, { userId });
  }
  /*
  async createCheckoutSession(
    ctx: GenericActionCtx<DataModel>,
    {
      productId,
      userId,
      email,
    }: { productId: string; userId: string; email: string }
  ) {
    const customer =
      (await ctx.runQuery(this.component.lib.getCustomerByUserId, {
        userId,
      })) ||
      (await this.polar.customers.create({
        email,
        metadata: {
          userId,
        },
      }));
    const customerId = customer?.id;
    if (!customerId) {
      throw new Error("Customer not found");
    }
    return this.polar.checkouts.custom.create({
      allowDiscountCodes: true,
      productId,
      customerId,
    });
  }
    */
  listProducts(
    ctx: RunQueryCtx,
    { includeArchived }: { includeArchived: boolean }
  ) {
    return ctx.runQuery(this.component.lib.listProducts, { includeArchived });
  }
  listUserSubscriptions(ctx: RunQueryCtx, { userId }: { userId: string }) {
    return ctx.runQuery(this.component.lib.listUserSubscriptions, { userId });
  }
  getSubscription(
    ctx: RunQueryCtx,
    { subscriptionId }: { subscriptionId: string }
  ) {
    return ctx.runQuery(this.component.lib.getSubscription, {
      id: subscriptionId,
    });
  }
  getProduct(ctx: RunQueryCtx, { productId }: { productId: string }) {
    return ctx.runQuery(this.component.lib.getProduct, { id: productId });
  }
  checkoutApi(opts: {
    getUserInfo: (ctx: RunQueryCtx) => Promise<{
      userId: string;
      email?: string;
    }>;
  }) {
    return {
      generateCheckoutLink: actionGeneric({
        args: {
          productId: v.string(),
          origin: v.string(),
        },
        returns: v.object({
          url: v.string(),
        }),
        handler: async (ctx, args) => {
          const { userId, email } = await opts.getUserInfo(ctx);
          const { url } = await this.polar.checkouts.create({
            productId: args.productId,
            embedOrigin: args.origin,
            customerEmail: email,
            metadata: {
              userId,
            },
          });
          return {
            url,
          };
        },
      }),
    };
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
                subscription: convertToDatabaseSubscription(
                  event.data.metadata.userId as string,
                  event.data
                ),
                callback:
                  this.onScheduleCreated &&
                  (await createFunctionHandle(this.onScheduleCreated)),
              });
              break;
            }
            case "subscription.updated": {
              await ctx.runMutation(this.component.lib.updateSubscription, {
                subscription: convertToDatabaseSubscription(
                  event.data.metadata.userId as string,
                  event.data
                ),
              });
              break;
            }
            case "product.created": {
              await ctx.runMutation(this.component.lib.createProduct, {
                product: convertToDatabaseProduct(event.data),
              });
              break;
            }
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
