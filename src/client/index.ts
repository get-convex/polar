import {
  Benefit$inboundSchema,
  BenefitGrant$inboundSchema,
  Product$inboundSchema,
  Subscription$inboundSchema,
  type WebhookBenefitCreatedPayload$Outbound,
  type WebhookBenefitGrantCreatedPayload$Outbound,
  type WebhookBenefitGrantUpdatedPayload$Outbound,
  type WebhookBenefitUpdatedPayload$Outbound,
  WebhookOrderCreatedPayload$inboundSchema,
  type WebhookOrderCreatedPayload$Outbound,
  type WebhookProductCreatedPayload$Outbound,
  type WebhookProductUpdatedPayload$Outbound,
  type WebhookSubscriptionCreatedPayload$Outbound,
  type WebhookSubscriptionUpdatedPayload$Outbound,
} from "@polar-sh/sdk/models/components";
import {
  type FunctionReference,
  type HttpRouter,
  createFunctionHandle,
  httpActionGeneric,
} from "convex/server";
import { Webhook } from "standardwebhooks";
import {
  convertToDatabaseBenefit,
  convertToDatabaseBenefitGrant,
  convertToDatabaseOrder,
  convertToDatabaseProduct,
  convertToDatabaseSubscription,
  type ComponentApi,
  type RunActionCtx,
  type RunQueryCtx,
} from "../component/util";

export type EventType = (
  | WebhookOrderCreatedPayload$Outbound
  | WebhookSubscriptionCreatedPayload$Outbound
  | WebhookSubscriptionUpdatedPayload$Outbound
  | WebhookBenefitCreatedPayload$Outbound
  | WebhookBenefitUpdatedPayload$Outbound
  | WebhookProductCreatedPayload$Outbound
  | WebhookProductUpdatedPayload$Outbound
  | WebhookBenefitGrantCreatedPayload$Outbound
  | WebhookBenefitGrantUpdatedPayload$Outbound
)["type"];

export type EventHandler = FunctionReference<
  "mutation",
  "internal",
  { payload: unknown }
>;

export class Polar {
  public readonly httpPath: string;
  public eventCallback?: EventHandler;

  constructor(
    public component: ComponentApi,
    options: {
      httpPath?: string;
      eventCallback?: EventHandler;
    } = {}
  ) {
    this.eventCallback = options?.eventCallback;
    this.httpPath = options.httpPath ?? "/polar/events";
  }

  async listUserSubscriptions(ctx: RunQueryCtx, userId: string) {
    return ctx.runQuery(this.component.lib.listUserSubscriptions, {
      userId,
    });
  }

  async listProducts(
    ctx: RunQueryCtx,
    { includeArchived = false }: { includeArchived?: boolean } = {}
  ) {
    return ctx.runQuery(this.component.lib.listPlans, { includeArchived });
  }

  async pullProducts(ctx: RunActionCtx) {
    return ctx.runAction(this.component.lib.pullProducts, {
      polarAccessToken: process.env.POLAR_ACCESS_TOKEN!,
      polarOrganizationId: process.env.POLAR_ORGANIZATION_ID!,
    });
  }

  registerRoutes(http: HttpRouter) {
    http.route({
      path: this.httpPath,
      method: "POST",
      handler: httpActionGeneric(async (ctx, request) => {
        if (!request.body) {
          throw new Error("No body");
        }
        const body = await request.text();
        const wh = new Webhook(btoa(process.env.POLAR_WEBHOOK_SECRET!));
        const headers = Object.fromEntries(request.headers.entries());
        const payload = wh.verify(body, headers) as {
          type: EventType;
          data: unknown;
        };

        switch (payload.type) {
          case "order.created": {
            await ctx.runMutation(this.component.lib.insertOrder, {
              order: convertToDatabaseOrder(
                WebhookOrderCreatedPayload$inboundSchema.parse(payload).data
              ),
            });
            break;
          }
          case "subscription.created": {
            await ctx.runMutation(this.component.lib.insertSubscription, {
              subscription: convertToDatabaseSubscription(
                Subscription$inboundSchema.parse(payload.data)
              ),
            });
            break;
          }
          case "subscription.updated": {
            await ctx.runMutation(this.component.lib.updateSubscription, {
              subscription: convertToDatabaseSubscription(
                Subscription$inboundSchema.parse(payload.data)
              ),
            });
            break;
          }
          case "product.created": {
            await ctx.runMutation(this.component.lib.insertProduct, {
              product: convertToDatabaseProduct(
                Product$inboundSchema.parse(payload.data)
              ),
            });
            break;
          }
          case "product.updated": {
            await ctx.runMutation(this.component.lib.updateProduct, {
              product: convertToDatabaseProduct(
                Product$inboundSchema.parse(payload.data)
              ),
            });
            break;
          }
          case "benefit.created": {
            await ctx.runMutation(this.component.lib.insertBenefit, {
              benefit: convertToDatabaseBenefit(
                Benefit$inboundSchema.parse(payload.data)
              ),
            });
            break;
          }
          case "benefit.updated": {
            await ctx.runMutation(this.component.lib.updateBenefit, {
              benefit: convertToDatabaseBenefit(
                Benefit$inboundSchema.parse(payload.data)
              ),
            });
            break;
          }
          case "benefit_grant.created": {
            await ctx.runMutation(this.component.lib.insertBenefitGrant, {
              benefitGrant: convertToDatabaseBenefitGrant(
                BenefitGrant$inboundSchema.parse(payload.data)
              ),
            });
            break;
          }
          case "benefit_grant.updated": {
            await ctx.runMutation(this.component.lib.updateBenefitGrant, {
              benefitGrant: convertToDatabaseBenefitGrant(
                BenefitGrant$inboundSchema.parse(payload.data)
              ),
            });
            break;
          }
        }

        if (this.eventCallback) {
          await ctx.runMutation(
            await createFunctionHandle(this.eventCallback),
            { payload }
          );
        }
        return new Response("OK", { status: 200 });
      }),
    });
  }
}
