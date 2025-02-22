import "./polyfill";
import {
  ApiFromModules,
  FunctionReference,
  GenericDataModel,
  type HttpRouter,
  actionGeneric,
  httpActionGeneric,
  GenericActionCtx,
  queryGeneric,
} from "convex/server";
import {
  type ComponentApi,
  convertToDatabaseProduct,
  convertToDatabaseSubscription,
  RunMutationCtx,
  RunQueryCtx,
} from "../component/util";
import { Polar as PolarSdk } from "@polar-sh/sdk";
import { Infer, v } from "convex/values";
import schema from "../component/schema";
import { WebhookSubscriptionCreatedPayload } from "@polar-sh/sdk/models/components/webhooksubscriptioncreatedpayload.js";
import { WebhookSubscriptionUpdatedPayload } from "@polar-sh/sdk/models/components/webhooksubscriptionupdatedpayload.js";
import { WebhookProductCreatedPayload } from "@polar-sh/sdk/models/components/webhookproductcreatedpayload.js";
import { WebhookProductUpdatedPayload } from "@polar-sh/sdk/models/components/webhookproductupdatedpayload.js";
import { Checkout } from "@polar-sh/sdk/models/components/checkout.js";
import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import { mapValues } from "remeda";

export const subscriptionValidator = schema.tables.subscriptions.validator;
export type Subscription = Infer<typeof subscriptionValidator>;

export type SubscriptionHandler = FunctionReference<
  "mutation",
  "internal",
  { subscription: Subscription }
>;

export type CheckoutApi<
  DataModel extends GenericDataModel = GenericDataModel,
  Products extends Record<string, string> = Record<string, string>,
> = ApiFromModules<{
  checkout: ReturnType<Polar<DataModel, Products>["checkoutApi"]>;
}>["checkout"];

export class Polar<
  DataModel extends GenericDataModel = GenericDataModel,
  Products extends Record<string, string> = Record<string, string>,
> {
  public sdk: PolarSdk;
  public products: Products;
  constructor(
    public component: ComponentApi,
    private config: {
      products: Products;
      getUserInfo: (ctx: RunQueryCtx) => Promise<{
        userId: string;
        email: string;
      }>;
    }
  ) {
    this.products = config.products;
    this.sdk = new PolarSdk({
      accessToken: process.env["POLAR_ORGANIZATION_TOKEN"] ?? "",
      server:
        (process.env["POLAR_SERVER"] as "sandbox" | "production") ?? "sandbox",
    });
  }
  getCustomerByUserId(ctx: RunQueryCtx, userId: string) {
    return ctx.runQuery(this.component.lib.getCustomerByUserId, { userId });
  }
  async createCheckoutSession(
    ctx: GenericActionCtx<DataModel>,
    {
      productId,
      yearlyProductId,
      userId,
      email,
      origin,
    }: {
      productId: string;
      yearlyProductId?: string;
      userId: string;
      email: string;
      origin: string;
    }
  ): Promise<Checkout> {
    const dbCustomer = await ctx.runQuery(
      this.component.lib.getCustomerByUserId,
      {
        userId,
      }
    );
    const customerId =
      dbCustomer?.id ||
      (
        await this.sdk.customers.create({
          email,
          metadata: {
            userId,
          },
        })
      ).id;
    if (!dbCustomer) {
      await ctx.runMutation(this.component.lib.insertCustomer, {
        id: customerId,
        userId,
      });
    }
    return this.sdk.checkouts.create({
      allowDiscountCodes: true,
      products: yearlyProductId ? [productId, yearlyProductId] : [productId],
      customerId,
      embedOrigin: origin,
    });
  }
  async createCustomerPortalSession(
    ctx: GenericActionCtx<DataModel>,
    { userId }: { userId: string }
  ) {
    const customer = await ctx.runQuery(
      this.component.lib.getCustomerByUserId,
      { userId }
    );

    if (!customer) {
      throw new Error("Customer not found");
    }

    const session = await this.sdk.customerSessions.create({
      customerId: customer.id,
    });

    return { url: session.customerPortalUrl };
  }
  listProducts(
    ctx: RunQueryCtx,
    { includeArchived }: { includeArchived?: boolean } = {}
  ) {
    return ctx.runQuery(this.component.lib.listProducts, {
      includeArchived,
    });
  }
  async getCurrentSubscription(
    ctx: RunQueryCtx,
    { userId }: { userId: string }
  ) {
    const subscription = await ctx.runQuery(
      this.component.lib.getCurrentSubscription,
      {
        userId,
      }
    );
    if (!subscription) {
      return null;
    }
    const productKey = (
      Object.keys(this.products) as Array<keyof Products>
    ).find((key) => this.products[key] === subscription.productId);
    return {
      ...subscription,
      productKey,
    };
  }
  getProduct(ctx: RunQueryCtx, { productId }: { productId: string }) {
    return ctx.runQuery(this.component.lib.getProduct, { id: productId });
  }
  async changeSubscription(
    ctx: GenericActionCtx<DataModel>,
    { productId }: { productId: string }
  ) {
    const { userId } = await this.config.getUserInfo(ctx);
    const subscription = await this.getCurrentSubscription(ctx, { userId });
    if (!subscription) {
      throw new Error("Subscription not found");
    }
    if (subscription.productId === productId) {
      throw new Error("Subscription already on this product");
    }
    await this.sdk.subscriptions.update({
      id: subscription.id,
      subscriptionUpdate: {
        productId,
      },
    });
  }
  async cancelSubscription(
    ctx: GenericActionCtx<DataModel>,
    { revokeImmediately }: { revokeImmediately?: boolean } = {}
  ) {
    const { userId } = await this.config.getUserInfo(ctx);
    const subscription = await this.getCurrentSubscription(ctx, { userId });
    if (!subscription) {
      throw new Error("Subscription not found");
    }
    if (subscription.status !== "active") {
      throw new Error("Subscription is not active");
    }
    await this.sdk.subscriptions.update({
      id: subscription.id,
      subscriptionUpdate: {
        cancelAtPeriodEnd: revokeImmediately ? null : true,
        revoke: revokeImmediately ? true : null,
      },
    });
  }
  api() {
    return {
      changeCurrentSubscription: actionGeneric({
        args: {
          productId: v.string(),
        },
        handler: async (ctx, args) => {
          await this.changeSubscription(ctx, {
            productId: args.productId,
          });
        },
      }),
      cancelCurrentSubscription: actionGeneric({
        args: {
          revokeImmediately: v.optional(v.boolean()),
        },
        handler: async (ctx, args) => {
          await this.cancelSubscription(ctx, {
            revokeImmediately: args.revokeImmediately,
          });
        },
      }),
      getProducts: queryGeneric({
        args: {},
        handler: async (ctx) => {
          const products = await this.listProducts(ctx);
          return mapValues(this.products, (productId) =>
            products.find((p) => p.id === productId)
          );
        },
      }),
    };
  }
  checkoutApi() {
    return {
      generateCheckoutLink: actionGeneric({
        args: {
          productId: v.string(),
          yearlyProductId: v.optional(v.string()),
          origin: v.string(),
        },
        returns: v.object({
          url: v.string(),
        }),
        handler: async (ctx, args) => {
          const { userId, email } = await this.config.getUserInfo(ctx);
          const { url } = await this.createCheckoutSession(ctx, {
            productId: args.productId,
            yearlyProductId: args.yearlyProductId,
            userId,
            email,
            origin: args.origin,
          });
          return { url };
        },
      }),
      generateCustomerPortalUrl: actionGeneric({
        args: {},
        returns: v.object({ url: v.string() }),
        handler: async (ctx) => {
          const { userId } = await this.config.getUserInfo(ctx);
          const { url } = await this.createCustomerPortalSession(ctx, {
            userId,
          });
          return { url };
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
                subscription: convertToDatabaseSubscription(event.data),
              });
              break;
            }
            case "subscription.updated": {
              await ctx.runMutation(this.component.lib.updateSubscription, {
                subscription: convertToDatabaseSubscription(event.data),
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
