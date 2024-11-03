import { type HttpRouter, httpActionGeneric } from "convex/server";
import {
  ComponentApi,
  RunActionCtx,
  RunMutationCtx,
  RunQueryCtx,
} from "../component/util";
import { handleWebhook } from "../component/webhook";

export class Polar {
  public readonly httpPath: string;

  constructor(
    public component: ComponentApi,
    options: {
      httpPath?: string;
    } = {}
  ) {
    this.httpPath = options.httpPath ?? "/polar/events";
  }

  async getUserSubscription(ctx: RunQueryCtx, userId: string) {
    const user = await ctx.runQuery(this.component.lib.getUser, { userId });
    return {
      subscriptionIsPending: user?.subscriptionIsPending,
      subscription: user?.subscription,
    };
  }

  async deleteUserSubscription(ctx: RunMutationCtx, userId: string) {
    return ctx.runMutation(this.component.lib.deleteUserSubscription, {
      userId,
    });
  }

  async seedProducts(ctx: RunActionCtx) {
    return ctx.runAction(this.component.init.seedProducts, {
      polarAccessToken: process.env.POLAR_ACCESS_TOKEN!,
      polarOrganizationId: process.env.POLAR_ORGANIZATION_ID!,
    });
  }

  async getOnboardingCheckoutUrl(
    ctx: RunActionCtx,
    args: {
      successUrl: string;
      userId: string;
      userEmail?: string;
    }
  ) {
    return ctx.runAction(this.component.lib.getOnboardingCheckoutUrl, {
      successUrl: args.successUrl,
      userId: args.userId,
      userEmail: args.userEmail,
      polarAccessToken: process.env.POLAR_ACCESS_TOKEN!,
    });
  }

  async getProOnboardingCheckoutUrl(
    ctx: RunActionCtx,
    args: {
      interval: "month" | "year";
      successUrl: string;
      userId: string;
    }
  ) {
    return ctx.runAction(this.component.lib.getProOnboardingCheckoutUrl, {
      interval: args.interval,
      successUrl: args.successUrl,
      userId: args.userId,
      polarAccessToken: process.env.POLAR_ACCESS_TOKEN!,
    });
  }

  async setSubscriptionPending(ctx: RunMutationCtx, userId: string) {
    return ctx.runMutation(this.component.lib.setSubscriptionPending, {
      userId,
    });
  }

  async listPlans(ctx: RunQueryCtx) {
    return ctx.runQuery(this.component.lib.listPlans);
  }

  registerRoutes(http: HttpRouter) {
    http.route({
      path: this.httpPath,
      method: "POST",
      handler: httpActionGeneric(async (ctx, request) => {
        return handleWebhook(this.component, ctx, request);
      }),
    });
  }
}
