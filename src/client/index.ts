import "./polyfill";
import { PolarCore } from "@polar-sh/sdk/core.js";
import { customersCreate } from "@polar-sh/sdk/funcs/customersCreate.js";
import { checkoutsCreate } from "@polar-sh/sdk/funcs/checkoutsCreate.js";
import { customerSessionsCreate } from "@polar-sh/sdk/funcs/customerSessionsCreate.js";
import { subscriptionsUpdate } from "@polar-sh/sdk/funcs/subscriptionsUpdate.js";

import type { Checkout } from "@polar-sh/sdk/models/components/checkout.js";
import type { WebhookProductCreatedPayload } from "@polar-sh/sdk/models/components/webhookproductcreatedpayload.js";
import type { WebhookProductUpdatedPayload } from "@polar-sh/sdk/models/components/webhookproductupdatedpayload.js";
import type { WebhookSubscriptionCreatedPayload } from "@polar-sh/sdk/models/components/webhooksubscriptioncreatedpayload.js";
import type { WebhookSubscriptionUpdatedPayload } from "@polar-sh/sdk/models/components/webhooksubscriptionupdatedpayload.js";
import {
  WebhookVerificationError,
  validateEvent,
} from "@polar-sh/sdk/webhooks";
import {
  type FunctionReference,
  type GenericActionCtx,
  type GenericDataModel,
  type HttpRouter,
  actionGeneric,
  httpActionGeneric,
  queryGeneric,
  ApiFromModules,
} from "convex/server";
import { type Infer, v } from "convex/values";
import { mapValues } from "remeda";
import schema from "../component/schema";
import {
  type ComponentApi,
  type RunMutationCtx,
  type RunQueryCtx,
  convertToDatabaseProduct,
  convertToDatabaseSubscription,
  RunActionCtx,
} from "../component/util";

export const subscriptionValidator = schema.tables.subscriptions.validator;
export type Subscription = Infer<typeof subscriptionValidator>;

export type SubscriptionHandler = FunctionReference<
  "mutation",
  "internal",
  { subscription: Subscription }
>;

export type PolarComponentApi = ApiFromModules<{
  checkout: ReturnType<Polar["api"]>;
}>["checkout"];

export class Polar<
  DataModel extends GenericDataModel = GenericDataModel,
  Products extends Record<string, string> = Record<string, string>,
> {
  public polar: PolarCore;
  public products: Products;
  private organizationToken: string;
  private webhookSecret: string;
  private server: "sandbox" | "production";

  constructor(
    public component: ComponentApi,
    private config: {
      products?: Products;
      getUserInfo: (ctx: RunQueryCtx) => Promise<{
        userId: string;
        email: string;
      }>;
      organizationToken?: string;
      webhookSecret?: string;
      server?: "sandbox" | "production";
    }
  ) {
    this.products = config.products ?? ({} as Products);
    this.organizationToken =
      config.organizationToken ?? process.env["POLAR_ORGANIZATION_TOKEN"] ?? "";
    this.webhookSecret =
      config.webhookSecret ?? process.env["POLAR_WEBHOOK_SECRET"] ?? "";
    this.server =
      config.server ??
      (process.env["POLAR_SERVER"] as "sandbox" | "production") ??
      "sandbox";

    this.polar = new PolarCore({
      accessToken: this.organizationToken,
      server: this.server,
    });
  }
  getCustomerByUserId(ctx: RunQueryCtx, userId: string) {
    return ctx.runQuery(this.component.lib.getCustomerByUserId, { userId });
  }
  async syncProducts(ctx: RunActionCtx) {
    await ctx.runAction(this.component.lib.syncProducts, {
      polarAccessToken: this.organizationToken,
      server: this.server,
    });
  }
  async createCheckoutSession(
    ctx: RunMutationCtx,
    {
      productIds,
      userId,
      email,
      origin,
      successUrl,
    }: {
      productIds: string[];
      userId: string;
      email: string;
      origin: string;
      successUrl: string;
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
        await customersCreate(this.polar, {
          email,
          metadata: {
            userId,
          },
        })
      ).value?.id;
    if (!customerId) {
      throw new Error("Customer not created");
    }
    if (!dbCustomer) {
      await ctx.runMutation(this.component.lib.insertCustomer, {
        id: customerId,
        userId,
      });
    }
    const checkout = await checkoutsCreate(this.polar, {
      allowDiscountCodes: true,
      customerId,
      embedOrigin: origin,
      successUrl,
      ...(productIds.length === 1
        ? { products: productIds }
        : { products: productIds }),
    });
    if (!checkout.value) {
      throw new Error("Checkout not created");
    }
    return checkout.value;
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

    const session = await customerSessionsCreate(this.polar, {
      customerId: customer.id,
    });
    if (!session.value) {
      throw new Error("Customer session not created");
    }

    return { url: session.value.customerPortalUrl };
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
    const product = await ctx.runQuery(this.component.lib.getProduct, {
      id: subscription.productId,
    });
    if (!product) {
      throw new Error("Product not found");
    }
    const productKey = (
      Object.keys(this.products) as Array<keyof Products>
    ).find((key) => this.products[key] === subscription.productId);
    return {
      ...subscription,
      productKey,
      product,
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
    const updatedSubscription = await subscriptionsUpdate(this.polar, {
      id: subscription.id,
      subscriptionUpdate: {
        productId,
      },
    });
    if (!updatedSubscription.value) {
      throw new Error("Subscription not updated");
    }
    return updatedSubscription.value;
  }
  async cancelSubscription(
    ctx: RunActionCtx,
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
    const updatedSubscription = await subscriptionsUpdate(this.polar, {
      id: subscription.id,
      subscriptionUpdate: {
        cancelAtPeriodEnd: revokeImmediately ? undefined : true,
        revoke: revokeImmediately ? true : undefined,
      },
    });
    if (!updatedSubscription.value) {
      throw new Error("Subscription not updated");
    }
    return updatedSubscription.value;
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
      getConfiguredProducts: queryGeneric({
        args: {},
        handler: async (ctx) => {
          const products = await this.listProducts(ctx);
          return mapValues(this.products, (productId) =>
            products.find((p) => p.id === productId)
          );
        },
      }),
      listAllProducts: queryGeneric({
        args: {},
        handler: async (ctx) => {
          return await this.listProducts(ctx);
        },
      }),
      generateCheckoutLink: actionGeneric({
        args: {
          productIds: v.array(v.string()),
          origin: v.string(),
          successUrl: v.string(),
        },
        returns: v.object({
          url: v.string(),
        }),
        handler: async (ctx, args) => {
          const { userId, email } = await this.config.getUserInfo(ctx);
          const { url } = await this.createCheckoutSession(ctx, {
            productIds: args.productIds,
            userId,
            email,
            origin: args.origin,
            successUrl: args.successUrl,
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
  /**
   * @deprecated: use api() instead
   */
  checkoutApi() {
    return this.api();
  }
  registerRoutes(
    http: HttpRouter,
    {
      path = "/polar/events",
      onSubscriptionCreated,
      onSubscriptionUpdated,
      onProductCreated,
      onProductUpdated,
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
          const event = validateEvent(body, headers, this.webhookSecret);
          switch (event.type) {
            case "subscription.created": {
              await ctx.runMutation(this.component.lib.createSubscription, {
                subscription: convertToDatabaseSubscription(event.data),
              });
              await onSubscriptionCreated?.(ctx, event);
              break;
            }
            case "subscription.updated": {
              await ctx.runMutation(this.component.lib.updateSubscription, {
                subscription: convertToDatabaseSubscription(event.data),
              });
              await onSubscriptionUpdated?.(ctx, event);
              break;
            }
            case "product.created": {
              await ctx.runMutation(this.component.lib.createProduct, {
                product: convertToDatabaseProduct(event.data),
              });
              await onProductCreated?.(ctx, event);
              break;
            }
            case "product.updated": {
              await ctx.runMutation(this.component.lib.updateProduct, {
                product: convertToDatabaseProduct(event.data),
              });
              await onProductUpdated?.(ctx, event);
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
