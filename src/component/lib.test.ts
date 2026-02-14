/// <reference types="vite/client" />
import { describe, it, expect, beforeEach } from "vitest";
import { convexTest } from "convex-test";
import type { TestConvex } from "convex-test";
import type { Infer } from "convex/values";
import schema from "./schema.js";
import { api } from "./_generated/api.js";
import { convertToDatabaseProduct } from "./util.js";
import type { Product } from "@polar-sh/sdk/models/components/product.js";

const modules = import.meta.glob("./**/*.ts");

// Types derived from schema validators
type DbSubscription = Infer<typeof schema.tables.subscriptions.validator>;
type DbProduct = Infer<typeof schema.tables.products.validator>;
type DbCustomer = Infer<typeof schema.tables.customers.validator>;

// Helper to create a minimal valid subscription for testing
function createTestSubscription(
  overrides: Partial<DbSubscription> = {},
): DbSubscription {
  return {
    id: "sub_123",
    customerId: "cust_456",
    productId: "prod_789",
    checkoutId: "checkout_abc",
    createdAt: "2025-01-15T10:00:00.000Z",
    modifiedAt: "2025-01-16T12:00:00.000Z",
    amount: 1000,
    currency: "usd",
    recurringInterval: "month",
    status: "active",
    currentPeriodStart: "2025-01-15T10:00:00.000Z",
    currentPeriodEnd: "2025-02-15T10:00:00.000Z",
    cancelAtPeriodEnd: false,
    startedAt: "2025-01-15T10:00:00.000Z",
    endedAt: null,
    metadata: {},
    ...overrides,
  };
}

// Helper to create a minimal valid product for testing
function createTestProduct(
  overrides: Partial<DbProduct> = {},
): DbProduct {
  return {
    id: "prod_123",
    organizationId: "org_456",
    name: "Test Product",
    description: "A test product",
    isRecurring: true,
    isArchived: false,
    createdAt: "2025-01-10T08:00:00.000Z",
    modifiedAt: "2025-01-12T09:00:00.000Z",
    recurringInterval: "month",
    metadata: {},
    prices: [],
    medias: [],
    benefits: [],
    ...overrides,
  };
}

// Helper to create a minimal valid customer for testing
function createTestCustomer(
  overrides: Partial<DbCustomer> = {},
): DbCustomer {
  return {
    id: "cust_123",
    userId: "user_456",
    ...overrides,
  };
}

// Helper to create SDK-shaped Product objects (uses Date objects, nested structures)
function createSdkProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "prod_123",
    organizationId: "org_456",
    name: "Test Product",
    description: "A test product",
    isRecurring: true,
    isArchived: false,
    createdAt: new Date("2025-01-10T08:00:00.000Z"),
    modifiedAt: new Date("2025-01-12T09:00:00.000Z"),
    recurringInterval: "month",
    recurringIntervalCount: 1,
    trialInterval: null,
    trialIntervalCount: null,
    metadata: {},
    prices: [],
    benefits: [],
    medias: [],
    attachedCustomFields: [],
    ...overrides,
  } as Product;
}

describe("createSubscription mutation", () => {
  let t: TestConvex<typeof schema>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  it("inserts when no existing record", async () => {
    const subscription = createTestSubscription();

    await t.mutation(api.lib.createSubscription, { subscription });

    const result = await t.query(api.lib.getSubscription, { id: "sub_123" });
    expect(result).not.toBeNull();
    expect(result?.id).toBe("sub_123");
    expect(result?.status).toBe("active");
  });

  it("patches when existing record has older modifiedAt", async () => {
    const oldSubscription = createTestSubscription({
      modifiedAt: "2025-01-15T10:00:00.000Z",
      status: "active",
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: oldSubscription,
    });

    const newSubscription = createTestSubscription({
      modifiedAt: "2025-01-16T12:00:00.000Z",
      status: "canceled",
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: newSubscription,
    });

    const result = await t.query(api.lib.getSubscription, { id: "sub_123" });
    expect(result?.status).toBe("canceled");
    expect(result?.modifiedAt).toBe("2025-01-16T12:00:00.000Z");
  });

  it("skips when existing record has newer modifiedAt (stale webhook)", async () => {
    const newSubscription = createTestSubscription({
      modifiedAt: "2025-01-20T10:00:00.000Z",
      status: "active",
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: newSubscription,
    });

    const staleSubscription = createTestSubscription({
      modifiedAt: "2025-01-15T10:00:00.000Z",
      status: "canceled",
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: staleSubscription,
    });

    const result = await t.query(api.lib.getSubscription, { id: "sub_123" });
    expect(result?.status).toBe("active");
    expect(result?.modifiedAt).toBe("2025-01-20T10:00:00.000Z");
  });

  it("patches when modifiedAt values are equal", async () => {
    const subscription1 = createTestSubscription({
      modifiedAt: "2025-01-15T10:00:00.000Z",
      status: "active",
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: subscription1,
    });

    const subscription2 = createTestSubscription({
      modifiedAt: "2025-01-15T10:00:00.000Z",
      status: "canceled",
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: subscription2,
    });

    const result = await t.query(api.lib.getSubscription, { id: "sub_123" });
    expect(result?.status).toBe("canceled");
  });

  it("treats null modifiedAt as oldest", async () => {
    const subscription1 = createTestSubscription({
      modifiedAt: null,
      status: "active",
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: subscription1,
    });

    const subscription2 = createTestSubscription({
      modifiedAt: "2025-01-15T10:00:00.000Z",
      status: "canceled",
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: subscription2,
    });

    const result = await t.query(api.lib.getSubscription, { id: "sub_123" });
    expect(result?.status).toBe("canceled");
  });
});

describe("updateSubscription mutation", () => {
  let t: TestConvex<typeof schema>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  it("inserts when no existing record (upsert behavior)", async () => {
    const subscription = createTestSubscription();

    await t.mutation(api.lib.updateSubscription, { subscription });

    const result = await t.query(api.lib.getSubscription, { id: "sub_123" });
    expect(result).not.toBeNull();
    expect(result?.id).toBe("sub_123");
  });

  it("patches when existing record has older modifiedAt", async () => {
    const oldSubscription = createTestSubscription({
      modifiedAt: "2025-01-15T10:00:00.000Z",
      status: "active",
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: oldSubscription,
    });

    const newSubscription = createTestSubscription({
      modifiedAt: "2025-01-16T12:00:00.000Z",
      status: "canceled",
    });
    await t.mutation(api.lib.updateSubscription, {
      subscription: newSubscription,
    });

    const result = await t.query(api.lib.getSubscription, { id: "sub_123" });
    expect(result?.status).toBe("canceled");
  });

  it("skips when existing record has newer modifiedAt (stale webhook)", async () => {
    const newSubscription = createTestSubscription({
      modifiedAt: "2025-01-20T10:00:00.000Z",
      status: "active",
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: newSubscription,
    });

    const staleSubscription = createTestSubscription({
      modifiedAt: "2025-01-15T10:00:00.000Z",
      status: "canceled",
    });
    await t.mutation(api.lib.updateSubscription, {
      subscription: staleSubscription,
    });

    const result = await t.query(api.lib.getSubscription, { id: "sub_123" });
    expect(result?.status).toBe("active");
  });
});

describe("createProduct mutation", () => {
  let t: TestConvex<typeof schema>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  it("inserts when no existing record", async () => {
    const product = createTestProduct();

    await t.mutation(api.lib.createProduct, { product });

    const result = await t.query(api.lib.getProduct, { id: "prod_123" });
    expect(result).not.toBeNull();
    expect(result?.id).toBe("prod_123");
    expect(result?.name).toBe("Test Product");
  });

  it("patches when existing record has older modifiedAt", async () => {
    const oldProduct = createTestProduct({
      modifiedAt: "2025-01-10T10:00:00.000Z",
      name: "Old Name",
    });
    await t.mutation(api.lib.createProduct, { product: oldProduct });

    const newProduct = createTestProduct({
      modifiedAt: "2025-01-15T10:00:00.000Z",
      name: "New Name",
    });
    await t.mutation(api.lib.createProduct, { product: newProduct });

    const result = await t.query(api.lib.getProduct, { id: "prod_123" });
    expect(result?.name).toBe("New Name");
  });

  it("skips when existing record has newer modifiedAt (stale webhook)", async () => {
    const newProduct = createTestProduct({
      modifiedAt: "2025-01-20T10:00:00.000Z",
      name: "Current Name",
    });
    await t.mutation(api.lib.createProduct, { product: newProduct });

    const staleProduct = createTestProduct({
      modifiedAt: "2025-01-10T10:00:00.000Z",
      name: "Stale Name",
    });
    await t.mutation(api.lib.createProduct, { product: staleProduct });

    const result = await t.query(api.lib.getProduct, { id: "prod_123" });
    expect(result?.name).toBe("Current Name");
  });

  it("treats null modifiedAt as oldest", async () => {
    const product1 = createTestProduct({
      modifiedAt: null,
      name: "Original Name",
    });
    await t.mutation(api.lib.createProduct, { product: product1 });

    const product2 = createTestProduct({
      modifiedAt: "2025-01-15T10:00:00.000Z",
      name: "Updated Name",
    });
    await t.mutation(api.lib.createProduct, { product: product2 });

    const result = await t.query(api.lib.getProduct, { id: "prod_123" });
    expect(result?.name).toBe("Updated Name");
  });
});

describe("updateProduct mutation", () => {
  let t: TestConvex<typeof schema>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  it("inserts when no existing record (upsert behavior)", async () => {
    const product = createTestProduct();

    await t.mutation(api.lib.updateProduct, { product });

    const result = await t.query(api.lib.getProduct, { id: "prod_123" });
    expect(result).not.toBeNull();
    expect(result?.id).toBe("prod_123");
  });

  it("patches when existing record has older modifiedAt", async () => {
    const oldProduct = createTestProduct({
      modifiedAt: "2025-01-10T10:00:00.000Z",
      name: "Old Name",
    });
    await t.mutation(api.lib.createProduct, { product: oldProduct });

    const newProduct = createTestProduct({
      modifiedAt: "2025-01-15T10:00:00.000Z",
      name: "New Name",
    });
    await t.mutation(api.lib.updateProduct, { product: newProduct });

    const result = await t.query(api.lib.getProduct, { id: "prod_123" });
    expect(result?.name).toBe("New Name");
  });

  it("skips when existing record has newer modifiedAt (stale webhook)", async () => {
    const newProduct = createTestProduct({
      modifiedAt: "2025-01-20T10:00:00.000Z",
      name: "Current Name",
    });
    await t.mutation(api.lib.createProduct, { product: newProduct });

    const staleProduct = createTestProduct({
      modifiedAt: "2025-01-10T10:00:00.000Z",
      name: "Stale Name",
    });
    await t.mutation(api.lib.updateProduct, { product: staleProduct });

    const result = await t.query(api.lib.getProduct, { id: "prod_123" });
    expect(result?.name).toBe("Current Name");
  });
});

describe("product price types (SDK → converter → DB round-trip)", () => {
  let t: TestConvex<typeof schema>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  it("converts and stores fixed price from SDK format", async () => {
    const sdkProduct = createSdkProduct({
      prices: [
        {
          id: "price_fixed",
          productId: "prod_123",
          createdAt: new Date("2025-01-10T08:00:00.000Z"),
          modifiedAt: null,
          source: "catalog",
          amountType: "fixed",
          isArchived: false,
          type: "recurring",
          recurringInterval: "month",
          priceCurrency: "usd",
          priceAmount: 1000,
        },
      ] as Product["prices"],
    });

    const dbProduct = convertToDatabaseProduct(sdkProduct);
    await t.mutation(api.lib.createProduct, { product: dbProduct });
    const result = await t.query(api.lib.getProduct, { id: "prod_123" });

    expect(result?.prices).toHaveLength(1);
    expect(result?.prices[0].amountType).toBe("fixed");
    expect(result?.prices[0].priceAmount).toBe(1000);
    expect(result?.prices[0].priceCurrency).toBe("usd");
    expect(result?.prices[0].source).toBe("catalog");
    expect(result?.prices[0].createdAt).toBe("2025-01-10T08:00:00.000Z");
  });

  it("converts and stores custom price from SDK format", async () => {
    const sdkProduct = createSdkProduct({
      isRecurring: false,
      recurringInterval: null,
      prices: [
        {
          id: "price_custom",
          productId: "prod_123",
          createdAt: new Date("2025-01-10T08:00:00.000Z"),
          modifiedAt: null,
          source: "catalog",
          amountType: "custom",
          isArchived: false,
          type: "one_time",
          recurringInterval: null,
          priceCurrency: "usd",
          minimumAmount: 500,
          maximumAmount: 10000,
          presetAmount: 2000,
        },
      ] as Product["prices"],
    });

    const dbProduct = convertToDatabaseProduct(sdkProduct);
    await t.mutation(api.lib.createProduct, { product: dbProduct });
    const result = await t.query(api.lib.getProduct, { id: "prod_123" });

    expect(result?.prices).toHaveLength(1);
    expect(result?.prices[0].amountType).toBe("custom");
    expect(result?.prices[0].priceCurrency).toBe("usd");
    expect(result?.prices[0].minimumAmount).toBe(500);
    expect(result?.prices[0].maximumAmount).toBe(10000);
    expect(result?.prices[0].presetAmount).toBe(2000);
  });

  it("converts and stores free price from SDK format", async () => {
    const sdkProduct = createSdkProduct({
      prices: [
        {
          id: "price_free",
          productId: "prod_123",
          createdAt: new Date("2025-01-10T08:00:00.000Z"),
          modifiedAt: null,
          source: "catalog",
          amountType: "free",
          isArchived: false,
          type: "recurring",
          recurringInterval: "month",
        },
      ] as Product["prices"],
    });

    const dbProduct = convertToDatabaseProduct(sdkProduct);
    await t.mutation(api.lib.createProduct, { product: dbProduct });
    const result = await t.query(api.lib.getProduct, { id: "prod_123" });

    expect(result?.prices).toHaveLength(1);
    expect(result?.prices[0].amountType).toBe("free");
  });

  it("converts and stores seat-based price from SDK format", async () => {
    const sdkProduct = createSdkProduct({
      prices: [
        {
          id: "price_seat",
          productId: "prod_123",
          createdAt: new Date("2025-01-10T08:00:00.000Z"),
          modifiedAt: null,
          source: "catalog",
          amountType: "seat_based",
          isArchived: false,
          type: "recurring",
          recurringInterval: "month",
          priceCurrency: "usd",
          seatTiers: {
            tiers: [
              { minSeats: 1, maxSeats: 5, pricePerSeat: 1000 },
              { minSeats: 6, maxSeats: null, pricePerSeat: 800 },
            ],
            minimumSeats: 1,
            maximumSeats: null,
          },
        },
      ] as Product["prices"],
    });

    const dbProduct = convertToDatabaseProduct(sdkProduct);
    await t.mutation(api.lib.createProduct, { product: dbProduct });
    const result = await t.query(api.lib.getProduct, { id: "prod_123" });

    expect(result?.prices).toHaveLength(1);
    expect(result?.prices[0].amountType).toBe("seat_based");
    expect(result?.prices[0].seatTiers).toHaveLength(2);
    expect(result?.prices[0].seatTiers?.[0].minSeats).toBe(1);
    expect(result?.prices[0].seatTiers?.[0].maxSeats).toBe(5);
    expect(result?.prices[0].seatTiers?.[0].pricePerSeat).toBe(1000);
    expect(result?.prices[0].seatTiers?.[1].maxSeats).toBeNull();
  });

  it("converts and stores metered unit price from SDK format", async () => {
    const sdkProduct = createSdkProduct({
      prices: [
        {
          id: "price_metered",
          productId: "prod_123",
          createdAt: new Date("2025-01-10T08:00:00.000Z"),
          modifiedAt: null,
          source: "catalog",
          amountType: "metered_unit",
          isArchived: false,
          type: "recurring",
          recurringInterval: "month",
          priceCurrency: "usd",
          unitAmount: "0.01",
          capAmount: 5000,
          meterId: "meter_123",
          meter: { id: "meter_123", name: "API Calls" },
        },
      ] as Product["prices"],
    });

    const dbProduct = convertToDatabaseProduct(sdkProduct);
    await t.mutation(api.lib.createProduct, { product: dbProduct });
    const result = await t.query(api.lib.getProduct, { id: "prod_123" });

    expect(result?.prices).toHaveLength(1);
    expect(result?.prices[0].amountType).toBe("metered_unit");
    expect(result?.prices[0].unitAmount).toBe("0.01");
    expect(result?.prices[0].capAmount).toBe(5000);
    expect(result?.prices[0].meterId).toBe("meter_123");
    expect(result?.prices[0].meter).toEqual({ id: "meter_123", name: "API Calls" });
  });

  it("converts and stores benefits from SDK format", async () => {
    const sdkProduct = createSdkProduct({
      benefits: [
        {
          id: "benefit_123",
          createdAt: new Date("2025-01-10T08:00:00.000Z"),
          modifiedAt: null,
          type: "custom",
          description: "Priority support",
          selectable: true,
          deletable: false,
          organizationId: "org_456",
          metadata: {},
          properties: { note: null },
        },
      ] as unknown as Product["benefits"],
    });

    const dbProduct = convertToDatabaseProduct(sdkProduct);
    await t.mutation(api.lib.createProduct, { product: dbProduct });
    const result = await t.query(api.lib.getProduct, { id: "prod_123" });

    expect(result?.benefits).toHaveLength(1);
    expect(result?.benefits?.[0].id).toBe("benefit_123");
    expect(result?.benefits?.[0].description).toBe("Priority support");
    expect(result?.benefits?.[0].selectable).toBe(true);
    expect(result?.benefits?.[0].deletable).toBe(false);
    expect(result?.benefits?.[0].createdAt).toBe("2025-01-10T08:00:00.000Z");
  });
});

describe("insertCustomer mutation", () => {
  let t: TestConvex<typeof schema>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  it("inserts new customer when none exists", async () => {
    const customer = createTestCustomer();

    const id = await t.mutation(api.lib.insertCustomer, customer);

    expect(id).toBeDefined();
    const result = await t.query(api.lib.getCustomerByUserId, {
      userId: "user_456",
    });
    expect(result).not.toBeNull();
    expect(result?.id).toBe("cust_123");
  });

  it("returns existing customer id when customer already exists for userId", async () => {
    const customer = createTestCustomer();

    const id1 = await t.mutation(api.lib.insertCustomer, customer);

    const customer2 = createTestCustomer({
      id: "cust_different",
    });
    const id2 = await t.mutation(api.lib.insertCustomer, customer2);

    expect(id1).toBe(id2);

    const result = await t.query(api.lib.getCustomerByUserId, {
      userId: "user_456",
    });
    expect(result?.id).toBe("cust_123");
  });

  it("allows different customers for different userIds", async () => {
    const customer1 = createTestCustomer({
      id: "cust_123",
      userId: "user_123",
    });
    const customer2 = createTestCustomer({
      id: "cust_456",
      userId: "user_456",
    });

    await t.mutation(api.lib.insertCustomer, customer1);
    await t.mutation(api.lib.insertCustomer, customer2);

    const result1 = await t.query(api.lib.getCustomerByUserId, {
      userId: "user_123",
    });
    const result2 = await t.query(api.lib.getCustomerByUserId, {
      userId: "user_456",
    });

    expect(result1?.id).toBe("cust_123");
    expect(result2?.id).toBe("cust_456");
  });
});

describe("getCurrentSubscription query", () => {
  let t: TestConvex<typeof schema>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  it("returns null when no customer exists", async () => {
    const result = await t.query(api.lib.getCurrentSubscription, {
      userId: "user_nonexistent",
    });

    expect(result).toBeNull();
  });

  it("returns null when customer has no subscriptions", async () => {
    await t.mutation(api.lib.insertCustomer, createTestCustomer());

    const result = await t.query(api.lib.getCurrentSubscription, {
      userId: "user_456",
    });

    expect(result).toBeNull();
  });

  it("returns null when customer only has ended subscriptions", async () => {
    const customer = createTestCustomer();
    await t.mutation(api.lib.insertCustomer, customer);
    await t.mutation(api.lib.createProduct, {
      product: createTestProduct({ id: "prod_789" }),
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: createTestSubscription({
        customerId: "cust_123",
        endedAt: "2025-01-10T10:00:00.000Z",
      }),
    });

    const result = await t.query(api.lib.getCurrentSubscription, {
      userId: "user_456",
    });

    expect(result).toBeNull();
  });

  it("returns active subscription with product", async () => {
    const customer = createTestCustomer();
    await t.mutation(api.lib.insertCustomer, customer);
    await t.mutation(api.lib.createProduct, {
      product: createTestProduct({ id: "prod_789" }),
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: createTestSubscription({
        customerId: "cust_123",
        endedAt: null,
      }),
    });

    const result = await t.query(api.lib.getCurrentSubscription, {
      userId: "user_456",
    });

    expect(result).not.toBeNull();
    expect(result?.id).toBe("sub_123");
    expect(result?.product.id).toBe("prod_789");
    expect(result?.product.name).toBe("Test Product");
  });

  it("returns null when trial has expired", async () => {
    await t.mutation(api.lib.insertCustomer, createTestCustomer());
    await t.mutation(api.lib.createProduct, {
      product: createTestProduct({ id: "prod_789" }),
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: createTestSubscription({
        customerId: "cust_123",
        endedAt: null,
        status: "trialing",
        trialStart: "2025-01-01T00:00:00.000Z",
        trialEnd: "2025-01-08T00:00:00.000Z",
      }),
    });

    const result = await t.query(api.lib.getCurrentSubscription, {
      userId: "user_456",
    });

    expect(result).toBeNull();
  });

  it("returns subscription when trial is still active", async () => {
    await t.mutation(api.lib.insertCustomer, createTestCustomer());
    await t.mutation(api.lib.createProduct, {
      product: createTestProduct({ id: "prod_789" }),
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: createTestSubscription({
        customerId: "cust_123",
        endedAt: null,
        status: "trialing",
        trialStart: "2025-01-01T00:00:00.000Z",
        trialEnd: "2099-01-01T00:00:00.000Z",
      }),
    });

    const result = await t.query(api.lib.getCurrentSubscription, {
      userId: "user_456",
    });

    expect(result).not.toBeNull();
    expect(result?.status).toBe("trialing");
  });
});

describe("listUserSubscriptions query", () => {
  let t: TestConvex<typeof schema>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  it("returns empty array when no customer exists", async () => {
    const result = await t.query(api.lib.listUserSubscriptions, {
      userId: "user_nonexistent",
    });

    expect(result).toEqual([]);
  });

  it("returns empty array when customer has no subscriptions", async () => {
    await t.mutation(api.lib.insertCustomer, createTestCustomer());

    const result = await t.query(api.lib.listUserSubscriptions, {
      userId: "user_456",
    });

    expect(result).toEqual([]);
  });

  it("excludes ended subscriptions", async () => {
    await t.mutation(api.lib.insertCustomer, createTestCustomer());
    await t.mutation(api.lib.createProduct, {
      product: createTestProduct({ id: "prod_789" }),
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: createTestSubscription({
        id: "sub_ended",
        customerId: "cust_123",
        endedAt: "2020-01-01T00:00:00.000Z",
      }),
    });

    const result = await t.query(api.lib.listUserSubscriptions, {
      userId: "user_456",
    });

    expect(result).toHaveLength(0);
  });

  it("returns active subscriptions with products", async () => {
    await t.mutation(api.lib.insertCustomer, createTestCustomer());
    await t.mutation(api.lib.createProduct, {
      product: createTestProduct({ id: "prod_789" }),
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: createTestSubscription({
        customerId: "cust_123",
        endedAt: null,
      }),
    });

    const result = await t.query(api.lib.listUserSubscriptions, {
      userId: "user_456",
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("sub_123");
    expect(result[0].product?.id).toBe("prod_789");
  });

  it("excludes expired trials", async () => {
    await t.mutation(api.lib.insertCustomer, createTestCustomer());
    await t.mutation(api.lib.createProduct, {
      product: createTestProduct({ id: "prod_789" }),
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: createTestSubscription({
        customerId: "cust_123",
        endedAt: null,
        status: "trialing",
        trialStart: "2025-01-01T00:00:00.000Z",
        trialEnd: "2025-01-08T00:00:00.000Z",
      }),
    });

    const result = await t.query(api.lib.listUserSubscriptions, {
      userId: "user_456",
    });

    expect(result).toHaveLength(0);
  });

  it("includes active trials", async () => {
    await t.mutation(api.lib.insertCustomer, createTestCustomer());
    await t.mutation(api.lib.createProduct, {
      product: createTestProduct({ id: "prod_789" }),
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: createTestSubscription({
        customerId: "cust_123",
        endedAt: null,
        status: "trialing",
        trialStart: "2025-01-01T00:00:00.000Z",
        trialEnd: "2099-01-01T00:00:00.000Z",
      }),
    });

    const result = await t.query(api.lib.listUserSubscriptions, {
      userId: "user_456",
    });

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("trialing");
  });

  it("returns multiple subscriptions", async () => {
    await t.mutation(api.lib.insertCustomer, createTestCustomer());
    await t.mutation(api.lib.createProduct, {
      product: createTestProduct({ id: "prod_1" }),
    });
    await t.mutation(api.lib.createProduct, {
      product: createTestProduct({ id: "prod_2" }),
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: createTestSubscription({
        id: "sub_1",
        customerId: "cust_123",
        productId: "prod_1",
        endedAt: null,
      }),
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: createTestSubscription({
        id: "sub_2",
        customerId: "cust_123",
        productId: "prod_2",
        endedAt: null,
      }),
    });

    const result = await t.query(api.lib.listUserSubscriptions, {
      userId: "user_456",
    });

    expect(result).toHaveLength(2);
  });
});

describe("listProducts query", () => {
  let t: TestConvex<typeof schema>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  it("returns empty array when no products exist", async () => {
    const result = await t.query(api.lib.listProducts, {});

    expect(result).toEqual([]);
  });

  it("returns all non-archived products by default", async () => {
    await t.mutation(api.lib.createProduct, {
      product: createTestProduct({ id: "prod_1", isArchived: false }),
    });
    await t.mutation(api.lib.createProduct, {
      product: createTestProduct({ id: "prod_2", isArchived: false }),
    });
    await t.mutation(api.lib.createProduct, {
      product: createTestProduct({ id: "prod_archived", isArchived: true }),
    });

    const result = await t.query(api.lib.listProducts, {});

    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id).sort()).toEqual(["prod_1", "prod_2"]);
  });

  it("includes archived products when includeArchived is true", async () => {
    await t.mutation(api.lib.createProduct, {
      product: createTestProduct({ id: "prod_1", isArchived: false }),
    });
    await t.mutation(api.lib.createProduct, {
      product: createTestProduct({ id: "prod_archived", isArchived: true }),
    });

    const result = await t.query(api.lib.listProducts, {
      includeArchived: true,
    });

    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id).sort()).toEqual(["prod_1", "prod_archived"]);
  });
});

describe("listCustomerSubscriptions query", () => {
  let t: TestConvex<typeof schema>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  it("returns empty array when no subscriptions exist", async () => {
    const result = await t.query(api.lib.listCustomerSubscriptions, {
      customerId: "cust_nonexistent",
    });

    expect(result).toEqual([]);
  });

  it("returns all subscriptions for customer", async () => {
    await t.mutation(api.lib.createSubscription, {
      subscription: createTestSubscription({
        id: "sub_1",
        customerId: "cust_123",
      }),
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: createTestSubscription({
        id: "sub_2",
        customerId: "cust_123",
      }),
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: createTestSubscription({
        id: "sub_other",
        customerId: "cust_other",
      }),
    });

    const result = await t.query(api.lib.listCustomerSubscriptions, {
      customerId: "cust_123",
    });

    expect(result).toHaveLength(2);
    expect(result.map((s) => s.id).sort()).toEqual(["sub_1", "sub_2"]);
  });
});

describe("listAllUserSubscriptions query", () => {
  let t: TestConvex<typeof schema>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  it("returns empty array when no customer exists", async () => {
    const result = await t.query(api.lib.listAllUserSubscriptions, {
      userId: "user_nonexistent",
    });

    expect(result).toEqual([]);
  });

  it("includes ended subscriptions", async () => {
    await t.mutation(api.lib.insertCustomer, createTestCustomer());
    await t.mutation(api.lib.createProduct, {
      product: createTestProduct({ id: "prod_789" }),
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: createTestSubscription({
        customerId: "cust_123",
        endedAt: "2020-01-01T00:00:00.000Z",
      }),
    });

    const result = await t.query(api.lib.listAllUserSubscriptions, {
      userId: "user_456",
    });

    expect(result).toHaveLength(1);
    expect(result[0].endedAt).toBe("2020-01-01T00:00:00.000Z");
  });

  it("includes expired trials", async () => {
    await t.mutation(api.lib.insertCustomer, createTestCustomer());
    await t.mutation(api.lib.createProduct, {
      product: createTestProduct({ id: "prod_789" }),
    });
    await t.mutation(api.lib.createSubscription, {
      subscription: createTestSubscription({
        customerId: "cust_123",
        endedAt: null,
        status: "trialing",
        trialStart: "2025-01-01T00:00:00.000Z",
        trialEnd: "2025-01-08T00:00:00.000Z",
      }),
    });

    const result = await t.query(api.lib.listAllUserSubscriptions, {
      userId: "user_456",
    });

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("trialing");
  });

  it("returns all subscriptions regardless of status", async () => {
    await t.mutation(api.lib.insertCustomer, createTestCustomer());
    await t.mutation(api.lib.createProduct, {
      product: createTestProduct({ id: "prod_789" }),
    });
    // Active subscription
    await t.mutation(api.lib.createSubscription, {
      subscription: createTestSubscription({
        id: "sub_active",
        customerId: "cust_123",
        endedAt: null,
        status: "active",
      }),
    });
    // Ended subscription
    await t.mutation(api.lib.createSubscription, {
      subscription: createTestSubscription({
        id: "sub_ended",
        customerId: "cust_123",
        endedAt: "2020-01-01T00:00:00.000Z",
        status: "canceled",
      }),
    });
    // Expired trial
    await t.mutation(api.lib.createSubscription, {
      subscription: createTestSubscription({
        id: "sub_expired_trial",
        customerId: "cust_123",
        endedAt: null,
        status: "trialing",
        trialStart: "2025-01-01T00:00:00.000Z",
        trialEnd: "2025-01-08T00:00:00.000Z",
      }),
    });

    const result = await t.query(api.lib.listAllUserSubscriptions, {
      userId: "user_456",
    });

    expect(result).toHaveLength(3);
    expect(result.map((s) => s.id).sort()).toEqual([
      "sub_active",
      "sub_ended",
      "sub_expired_trial",
    ]);
  });
});
