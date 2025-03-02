# Convex Polar Component [![npm version](https://badge.fury.io/js/@convex-dev%2Fpolar.svg)](https://badge.fury.io/js/@convex-dev%2Fpolar)

Add subscriptions and billing to your Convex app with [Polar](https://polar.sh).

```tsx
// Add subscriptions to your app
const user = useQuery(api.example.getCurrentUser);

// Show available plans
<CheckoutLink
  polarApi={api.example}
  productIds={[products.premiumMonthly.id, products.premiumYearly.id]}
>
  Upgrade to Premium
</CheckoutLink>

// Manage existing subscriptions
<CustomerPortalLink polarApi={api.example}>
  Manage Subscription
</CustomerPortalLink>
```

**Check out the [example app](example) for a complete example.**

## Prerequisites

### Convex App
You'll need a Convex App to use the component. Follow any of the [Convex quickstarts](https://docs.convex.dev/home) to set one up.

### Polar Account
- [Create a Polar account](https://polar.sh)
- Create an organization and generate an organization token with permissions:
  - `products:read`
  - `products:write`
  - `subscriptions:read`
  - `subscriptions:write`
  - `customers:read`
  - `customers:write`
  - `checkouts:read`
  - `checkouts:write`
  - `checkout_links:read`
  - `checkout_links:write`
  - `customer_portal:read`
  - `customer_portal:write`
  - `customer_sessions:write`


## Installation

Install the component package:

```ts
npm install @convex-dev/polar
```

Create a `convex.config.ts` file in your app's `convex/` folder and install the
component by calling `app.use`:

```ts
// convex/convex.config.ts
import { defineApp } from "convex/server";
import polar from "@convex-dev/polar/convex.config";

const app = defineApp();
app.use(polar);

export default app;
```

Set your Polar organization token:
```sh
npx convex env set POLAR_ORGANIZATION_TOKEN xxxxx
```

## Usage

### 1. Set up Polar webhooks

The Polar component uses webhooks to keep subscription data in sync. You'll need to:

1. Create a webhook and webhook secret in the Polar dashboard, using your
   [Convex site
   URL](https://docs.convex.dev/production/environment-variables#system-environment-variables) + `/polar/events` as the webhook endpoint. Enable the following events:
     - `product.created`
     - `product.updated`
     - `subscription.created`
     - `subscription.updated`
2. Set the webhook secret in your Convex environment:
```sh
npx convex env set POLAR_WEBHOOK_SECRET xxxxx
```

3. Register the webhook handler in your `convex/http.ts`:
```ts
import { httpRouter } from "convex/server";
import { polar } from "./example";

const http = httpRouter();

// Register the webhook handler at /polar/events
polar.registerRoutes(http as any);

export default http;
```
4. Be sure to run `npx convex dev` to start your Convex app with the Polar
   component enabled, which will deploy the webhook handler to your Convex
   instance.

### 2. Create products in Polar

Create a product in the Polar dashboard for each pricing plan that you want to
offer. The product data will be synced to your Convex app automatically.

**Note:** You can have one price per plan, so a plan with monthly and yearly
pricing requires two products in Polar.

**Note:** The Convex Polar component is currently built to support recurring
subscriptions, and may not work as expected with one-time payments. Please
[open an issue](https://github.com/convex-dev/polar/issues) or [reach out on Discord](https://discord.gg/convex)
if you run into any issues.


### 3. Initialize the Polar client

Create a Polar client in your Convex backend:

```ts
// convex/example.ts
import { Polar } from "@convex-dev/polar";
import { api, components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";

export const polar = new Polar(components.polar, {
  // Optional: Configure static keys for referencing your products.
  // Alternatively you can use the `listAllProducts` function to get
  // the product data and sort it out in your UI however you like
  // (eg., by price, name, recurrence, etc.).
  // Map your product keys to Polar product IDs (you can also use env vars for this)
  // Replace these with whatever your products are (eg., "pro", "pro_monthly", whatever you want)
  products: {
    premiumMonthly: "product_id_from_polar",
    premiumYearly: "product_id_from_polar",
    premiumPlusMonthly: "product_id_from_polar",
    premiumPlusYearly: "product_id_from_polar",
  },
  // Provide a function the component can use to get the current user's ID and email
  getUserInfo: async (ctx) => {
    const user = await ctx.runQuery(api.example.getCurrentUser);
    return {
      userId: user._id,
      email: user.email,
    };
  },
  // Optional: Configure Polar settings directly in code
  // organizationToken: "your_organization_token", // Optional: Falls back to POLAR_ORGANIZATION_TOKEN env var
  // webhookSecret: "your_webhook_secret", // Optional: Falls back to POLAR_WEBHOOK_SECRET env var
  // server: "sandbox", // Optional: "sandbox" or "production", falls back to POLAR_SERVER env var
});

// Export the API functions
export const {
  changeCurrentSubscription,
  cancelCurrentSubscription,
  getProducts,
  listAllProducts,
} = polar.api();

export const {
  generateCheckoutLink,
  generateCustomerPortalUrl,
} = polar.checkoutApi();

export const _ = query(
```

### 4. Display products and prices

Use the exported `getProducts` or `listAllProducts`function to display your products and their prices:

```tsx
// React component
const products = useQuery(api.example.getProducts);

// Simple example of displaying products and prices
function PricingTable() {
  const products = useQuery(api.example.getProducts);
  if (!products) return null;

  return (
    <div>
      {products.premiumMonthly && (
        <div>
          <h3>{products.premiumMonthly.name}</h3>
          <p>
            ${(products.premiumMonthly.prices[0].priceAmount ?? 0) / 100}/month
          </p>
        </div>
      )}
      {products.premiumYearly && (
        <div>
          <h3>{products.premiumYearly.name}</h3>
          <p>
            ${(products.premiumYearly.prices[0].priceAmount ?? 0) / 100}/year
          </p>
        </div>
      )}
    </div>
  );
}
```

Each product includes:
- `id`: The Polar product ID
- `name`: The product name
- `prices`: Array of prices with:
  - `priceAmount`: Price in cents
  - `priceCurrency`: Currency code (e.g., "USD")
  - `recurringInterval`: "month" or "year"

### 4. Add subscription UI components

Use the provided React components to add subscription functionality to your app:

```tsx
import { CheckoutLink, CustomerPortalLink } from "@convex-dev/polar/react";
import { api } from "../convex/_generated/api";

// For new subscriptions
<CheckoutLink
  polarApi={{
    generateCheckoutLink: api.example.generateCheckoutLink,
  }}
  productIds={[products.premiumMonthly.id, products.premiumYearly.id]}
>
  Upgrade to Premium
</CheckoutLink>

// For managing existing subscriptions
<CustomerPortalLink
  polarApi={{
    generateCustomerPortalUrl: api.example.generateCustomerPortalUrl,
  }}
>
  Manage Subscription
</CustomerPortalLink>
```

### 5. Handle subscription changes

The Polar component provides functions to handle subscription changes for the
current user.

**Note:** It is highly recommended to prompt the user for confirmation before
changing their subscription this way!

```ts
// Change subscription
const changeSubscription = useAction(api.example.changeCurrentSubscription);
await changeSubscription({ productId: "new_product_id" });

// Cancel subscription
const cancelSubscription = useAction(api.example.cancelCurrentSubscription);
await cancelSubscription({ revokeImmediately: true });
```

### 6. Access subscription data

Query subscription information in your app:

```ts
// convex/example.ts

// A query that returns a user with their subscription details
export const getCurrentUser = query({
  handler: async (ctx) => {
    const user = await ctx.db.query("users").first();
    if (!user) throw new Error("No user found");
    
    const subscription = await polar.getCurrentSubscription(ctx, {
      userId: user._id,
    });
    
    return {
      ...user,
      subscription,
      isFree: !subscription,
      isPremium: subscription?.productKey === "premiumMonthly" || 
                subscription?.productKey === "premiumYearly",
    };
  },
});
```

## Example App Features

The example app demonstrates:
- Free and paid subscription tiers
- Monthly and yearly billing options
- Upgrade/downgrade between plans
- Subscription management portal
- Usage limits based on subscription tier
- Prorated billing for plan changes

## API Reference

### Polar Client

The `Polar` class accepts a configuration object with:
- `products`: Map of product keys to Polar product IDs
- `getUserInfo`: Function to get the current user's ID and email
- `organizationToken`: (Optional) Your Polar organization token. Falls back to `POLAR_ORGANIZATION_TOKEN` env var
- `webhookSecret`: (Optional) Your Polar webhook secret. Falls back to `POLAR_WEBHOOK_SECRET` env var
- `server`: (Optional) Polar server environment: "sandbox" or "production". Falls back to `POLAR_SERVER` env var

### React Components

#### CheckoutLink
Props:
- `polarApi`: Object containing `generateCheckoutLink` function
- `productIds`: Array of product IDs to show in the checkout
- `className`: Optional CSS class name
- `children`: React children (button content)

#### CustomerPortalLink
Props:
- `polarApi`: Object containing `generateCustomerPortalUrl` function
- `className`: Optional CSS class name
- `children`: React children (button content)

### API Functions

#### changeCurrentSubscription
Change an existing subscription to a new plan:
```ts
await changeSubscription({ productId: "new_product_id" });
```

#### cancelCurrentSubscription
Cancel an existing subscription:
```ts
await cancelSubscription({ revokeImmediately: true });
```

#### getCurrentSubscription
Get the current user's subscription details:
```ts
const subscription = await polar.getCurrentSubscription(ctx, { userId });
```

#### getProducts
List all available products and their prices:
```ts
const products = await polar.listProducts(ctx);
```

#### registerRoutes
Register webhook handlers for the Polar component:
```ts
polar.registerRoutes(http, {
  // Optional: customize the webhook endpoint path (defaults to "/polar/events")
  path: "/custom/webhook/path",
});
```

The webhook handler uses the `webhookSecret` from the Polar client configuration or the `POLAR_WEBHOOK_SECRET` environment variable.