# Changelog

## 0.8.2

- chore: upgrade `@polar-sh/sdk` peer dependency from `0.42.5` to `0.45.0`
- fix: update test fixtures for new `ProductPrice` union types — `type` and `recurringInterval` are no longer present on `ProductPriceCustom`, `ProductPriceFree`, `ProductPriceSeatBased`, and `ProductPriceMeteredUnit`; they are now derived from the product-level fields
- test: add 18 new tests covering SDK 0.45.0 breaking changes (new-style prices, legacy recurring prices, `ProductPriceSeatTiersOutput`, and `convertToDatabaseSubscription` date handling)

## 0.8.1

- feat: add typesafe webhook event handlers with full type inference for all 30+
  Polar webhook events
- fix: prevent potential auth token leakage in SDK error logging
- fix: handle "customer already exists" error when users recreate their account

## 0.8.0

- feat: add trial subscription support with lazy checkout mode
- feat: support new Polar price types (custom, seat-based, metered unit) and
  product benefits
- feat: add optional metadata prop to CheckoutLink for passing custom data to
  checkout sessions
- fix: add webhook resilience with upsert semantics and timestamp guards
- fix: generic type parameter in README example
- chore: update dependencies

## 0.7.3

- update scripts and config files

## 0.7.1

- update dependencies and build output

## 0.7.0

- Adds /test and /\_generated/component.js entrypoints
- Drops commonjs support
- Improves source mapping for generated files
- Changes to a statically generated component API
