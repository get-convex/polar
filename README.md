# Convex Polar Component

[![npm version](https://badge.fury.io/js/@convex-dev%2Fpolar.svg)](https://badge.fury.io/js/@convex-dev%2Fpolar)

<!-- START: Include on https://convex.dev/components -->

Keep your Polar subscriptions and other data synced to your Convex database.

```ts
import { Polar } from "@convex-dev/polar";
import { components } from "./_generated/api";

export const polar = new Polar(components.polar);

export const listUserSubscriptions = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return polarComponent.listUserSubscriptions(ctx, args.userId);
  },
});
```

## Prerequisites

### Polar Account

Create a Polar account and get the following credentials:

- **Access Token**
  - Go to your Polar account settings and generate a new access token.
- **Organization ID**
  - This is the ID of your organization in Polar, also located in settings.
- **Webhook Secret**
  - Go to your Polar account settings and generate a new webhook secret.
  - You'll need your webhook url, which will be your Convex deployment's HTTP
    Actions URL (ends with `.convex.site`) followed by your polar event path
    (default is `/events/polar`).
  - You'll be able to choose which events to subscribe to. This component syncs
    data from the following events if enabled in webhook settings:
    - `subscription.created`
    - `subscription.updated`
    - `order.created`
    - `benefit.created`
    - `benefit.updated`
    - `benefit_grant.created`
    - `benefit_grant.updated`
    - `product.created`
    - `product.updated`

### Convex App

You'll need a Convex App to use the component. Follow any of the [Convex quickstarts](https://docs.convex.dev/home) to set one up.

## Installation

Install the component package:

```ts
npm install @convex-dev/polar
```

Create a `convex.config.ts` file in your app's `convex/` folder and install the component by calling `use`:

```ts
// convex/convex.config.ts
import { defineApp } from "convex/server";
import polar from "@convex-dev/polar/convex.config";

const app = defineApp();
app.use(polar);

export default app;
```

Set your API credentials:

```sh
npx convex env set POLAR_ACCESS_TOKEN=xxxxx
npx convex env set POLAR_ORGANIZATION_ID=xxxxx
npx convex env set POLAR_WEBHOOK_SECRET=xxxxx

# Optional: can be sandbox or production (default: production)
npx convex env set POLAR_SERVER=sandbox
```

Instantiate a Polar Component client in a file in your app's `convex/` folder:

```ts
// convex/example.ts
import { Polar } from "@convex-dev/polar";
import { components } from "./_generated/api";

export const polar = new Polar(components.polar);

// Create an action to get a Polar checkout URL
export const getCheckoutUrl = action({
  args: {
    priceId: v.string(),
  },
  handler: async (ctx, args) => {
    // Call your own user query to get the current user
    const user = await ctx.runQuery(api.users.getUser);
    const polar = new Polar({
      server: "sandbox",
      accessToken: env.POLAR_ACCESS_TOKEN,
    });
    const result = await polar.checkouts.custom.create({
      productPriceId: priceId,
      successUrl: 'https://example.com/subscription-success',
      customerEmail: user.email,
      metadata: {
        // Arbitrary metadata. This can be used to connect the user's ID with the
        // Polar subscription and then associate resulting webhooks with the user
        // in your system.
        userId: user._id,
      },
    });
    return result.url;
  },
});

// The Polar component already handles syncing data from webhooks for you, but
// you have to provide your own logic to connect a polar user id to a user in
// your system. This callback retrieves the user ID from the metadata as it was
// passed in to the checkout and then associates the polar user id with the user
// in your system.
export const polarEventCallback = internalMutation({
  args: {
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    switch (args.payload.type) {
      case "subscription.created": {
        const payload = WebhookSubscriptionCreatedPayload$inboundSchema.parse(
          args.payload,
        );
        // Use the metadata to connect the user's ID with the Polar subscription
        const userId = payload.data.metadata.userId;
        await ctx.db.patch(userId as Id<"users">, {
          polarId: payload.data.userId,
        });
        break;
      }
    }
  },
});

```

Register Polar webhook handlers by creating an `http.ts` file in your `convex/` folder and use the client you've exported above:

```ts
// http.ts
import { polar } from "./example";
import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// this call registers the routes necessary for the component
polar.registerRoutes(http, {
  // Optionally override the default path that Polar events will be sent to
  // (default is /events/polar)
  path: "/events/polar",
  // Optionally provide a callback to run on each event
  eventCallback: internal.example.polarEventCallback,
});
export default http;
```

## Querying Polar data

To list all subscriptions for a user, use the `listUserSubscriptions` method in your Convex function.

```ts
// convex/subscriptions.ts
export const listUserSubscriptions = query({
  args: {
    // Note: this is the user's Polar ID, not their ID from your system. See
    // above for how to retrieve and store the user's Polar ID with your system
    // user data.
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.runQuery(polar.component.lib.listUserSubscriptions, {
      userId: args.userId,
    });
  },
});

```

To list all products, use `listProducts`:

```ts
export const listProducts = query({
  args: {},
  handler: async (ctx) => {
    return polar.listProducts(ctx, { includeArchived: false });
  },
});
```


List user benefit grants:

```ts
export const listUserBenefitGrants = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return polar.listUserBenefitGrants(ctx, { userId: args.userId });
  },
});
```

Get data by ID:

```ts
export const getSubscription = query({
  args: {
    id: v.id("subscriptions"),
  },
  handler: async (ctx, args) => {
    return polar.getSubscription(ctx, { id: args.id });
  },
});

export const getOrder = query({
  args: {
    id: v.id("orders"),
  },
  handler: async (ctx, args) => {
    return polar.getOrder(ctx, { id: args.id });
  },
});

export const getProduct = query({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    return polar.getProduct(ctx, { id: args.id });
  },
});

export const getBenefit = query({
  args: {
    id: v.id("benefits"),
  },
  handler: async (ctx, args) => {
    return polar.getBenefit(ctx, { id: args.id });
  },
});

export const getBenefitGrant = query({
  args: {
    id: v.id("benefitGrants"),
  },
  handler: async (ctx, args) => {
    return polar.getBenefitGrant(ctx, { id: args.id });
  },
});
```

<!-- END: Include on https://convex.dev/components -->