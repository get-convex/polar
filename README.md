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

### Polar Account
- [Create a Polar account](https://polar.sh)
- Create an organization
- Create products and pricing plans
- Get your organization token from the settings page

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

Set your Polar organization token:
```sh
npx convex env set POLAR_ORGANIZATION_TOKEN xxxxx
```

## Usage

### 1. Initialize the Polar client

Create a Polar client in your Convex backend:

```ts
// convex/example.ts
import { Polar } from "@convex-dev/polar";
import { api, components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";

export const polar = new Polar<DataModel>(components.polar, {
  products: {
    // Map your product keys to Polar product IDs
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
});

// Export the API functions
export const {
  changeCurrentSubscription,
  cancelCurrentSubscription,
  getProducts,
} = polar.api();

export const {
  generateCheckoutLink,
  generateCustomerPortalUrl,
} = polar.checkoutApi();
```

### 2. Add subscription UI components

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

### 3. Handle subscription changes

The Polar component provides functions to handle subscription changes:

```ts
// Change subscription
const changeSubscription = useAction(api.example.changeCurrentSubscription);
await changeSubscription({ productId: "new_product_id" });

// Cancel subscription
const cancelSubscription = useAction(api.example.cancelCurrentSubscription);
await cancelSubscription({ revokeImmediately: true });
```

### 4. Access subscription data

Query subscription information in your app:

```ts
// convex/example.ts
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