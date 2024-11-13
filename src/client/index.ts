import {
  WebhookBenefitCreatedPayload$inboundSchema,
  WebhookBenefitGrantCreatedPayload$inboundSchema,
  WebhookBenefitGrantUpdatedPayload$inboundSchema,
  WebhookBenefitUpdatedPayload$inboundSchema,
  WebhookOrderCreatedPayload$inboundSchema,
  WebhookProductCreatedPayload$inboundSchema,
  WebhookProductUpdatedPayload$inboundSchema,
  WebhookSubscriptionCreatedPayload$inboundSchema,
  WebhookSubscriptionUpdatedPayload$inboundSchema,
  type WebhookBenefitCreatedPayload$Outbound,
  type WebhookBenefitGrantCreatedPayload$Outbound,
  type WebhookBenefitGrantUpdatedPayload$Outbound,
  type WebhookBenefitUpdatedPayload$Outbound,
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
  constructor(public component: ComponentApi) {}

  registerRoutes(
    http: HttpRouter,
    {
      path = "/polar/events",
      eventCallback,
    }: { eventCallback?: EventHandler; path?: string } = {}
  ) {
    http.route({
      path,
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
            await ctx.runMutation(this.component.lib.updateOrder, {
              order: convertToDatabaseOrder(
                WebhookOrderCreatedPayload$inboundSchema.parse(payload).data
              ),
            });
            break;
          }
          case "subscription.created":
          case "subscription.updated": {
            const schema =
              payload.type === "subscription.created"
                ? WebhookSubscriptionCreatedPayload$inboundSchema
                : WebhookSubscriptionUpdatedPayload$inboundSchema;
            await ctx.runMutation(this.component.lib.updateSubscription, {
              subscription: convertToDatabaseSubscription(
                schema.parse(payload).data
              ),
            });
            break;
          }
          case "product.created":
          case "product.updated": {
            const schema =
              payload.type === "product.created"
                ? WebhookProductCreatedPayload$inboundSchema
                : WebhookProductUpdatedPayload$inboundSchema;
            await ctx.runMutation(this.component.lib.updateProduct, {
              product: convertToDatabaseProduct(schema.parse(payload).data),
            });
            break;
          }
          case "benefit.created":
          case "benefit.updated": {
            const schema =
              payload.type === "benefit.created"
                ? WebhookBenefitCreatedPayload$inboundSchema
                : WebhookBenefitUpdatedPayload$inboundSchema;
            await ctx.runMutation(this.component.lib.updateBenefit, {
              benefit: convertToDatabaseBenefit(schema.parse(payload).data),
            });
            break;
          }
          case "benefit_grant.created":
          case "benefit_grant.updated": {
            const schema =
              payload.type === "benefit_grant.created"
                ? WebhookBenefitGrantCreatedPayload$inboundSchema
                : WebhookBenefitGrantUpdatedPayload$inboundSchema;
            await ctx.runMutation(this.component.lib.updateBenefitGrant, {
              benefitGrant: convertToDatabaseBenefitGrant(
                schema.parse(payload).data
              ),
            });
            break;
          }
        }

        if (eventCallback) {
          await ctx.runMutation(await createFunctionHandle(eventCallback), {
            payload,
          });
        }
        return new Response("OK", { status: 200 });
      }),
    });
  }
}
