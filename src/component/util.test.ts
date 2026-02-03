import { describe, it, expect } from "vitest";
import {
  convertToDatabaseSubscription,
  convertToDatabaseProduct,
} from "./util.js";
import type { Subscription } from "@polar-sh/sdk/models/components/subscription.js";
import type { Product } from "@polar-sh/sdk/models/components/product.js";

// Minimal mock that satisfies the Subscription type for converter testing
function createMockSubscription(
  overrides: Partial<Subscription> = {},
): Subscription {
  return {
    id: "sub_123",
    customerId: "cust_456",
    productId: "prod_789",
    checkoutId: "checkout_abc",
    createdAt: new Date("2025-01-15T10:00:00Z"),
    modifiedAt: new Date("2025-01-16T12:00:00Z"),
    amount: 1000,
    currency: "usd",
    recurringInterval: "month",
    recurringIntervalCount: 1,
    status: "active",
    currentPeriodStart: new Date("2025-01-15T10:00:00Z"),
    currentPeriodEnd: new Date("2025-02-15T10:00:00Z"),
    cancelAtPeriodEnd: false,
    canceledAt: null,
    startedAt: new Date("2025-01-15T10:00:00Z"),
    endedAt: null,
    endsAt: null,
    trialStart: null,
    trialEnd: null,
    discountId: null,
    seats: null,
    metadata: {},
    customFieldData: undefined,
    customerCancellationReason: null,
    customerCancellationComment: null,
    // Required nested objects (not used by converter but needed for type)
    customer: {} as Subscription["customer"],
    product: {} as Subscription["product"],
    discount: null,
    prices: [],
    meters: [],
    ...overrides,
  } as Subscription;
}

// Minimal mock that satisfies the Product type for converter testing
function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "prod_123",
    organizationId: "org_456",
    name: "Test Product",
    description: "A test product",
    isRecurring: true,
    isArchived: false,
    createdAt: new Date("2025-01-10T08:00:00Z"),
    modifiedAt: new Date("2025-01-12T09:00:00Z"),
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

describe("convertToDatabaseSubscription", () => {
  it("converts all required fields correctly", () => {
    const subscription = createMockSubscription();
    const result = convertToDatabaseSubscription(subscription);

    expect(result.id).toBe("sub_123");
    expect(result.customerId).toBe("cust_456");
    expect(result.productId).toBe("prod_789");
    expect(result.checkoutId).toBe("checkout_abc");
    expect(result.amount).toBe(1000);
    expect(result.currency).toBe("usd");
    expect(result.recurringInterval).toBe("month");
    expect(result.status).toBe("active");
    expect(result.cancelAtPeriodEnd).toBe(false);
  });

  it("converts Date fields to ISO strings", () => {
    const subscription = createMockSubscription();
    const result = convertToDatabaseSubscription(subscription);

    expect(result.createdAt).toBe("2025-01-15T10:00:00.000Z");
    expect(result.modifiedAt).toBe("2025-01-16T12:00:00.000Z");
    expect(result.currentPeriodStart).toBe("2025-01-15T10:00:00.000Z");
    expect(result.currentPeriodEnd).toBe("2025-02-15T10:00:00.000Z");
    expect(result.startedAt).toBe("2025-01-15T10:00:00.000Z");
  });

  it("handles null modifiedAt", () => {
    const subscription = createMockSubscription({ modifiedAt: null });
    const result = convertToDatabaseSubscription(subscription);

    expect(result.modifiedAt).toBeNull();
  });

  it("handles nullable date fields", () => {
    const subscription = createMockSubscription({
      currentPeriodEnd: null,
      startedAt: null,
      endedAt: null,
      canceledAt: null,
      endsAt: null,
      trialStart: null,
      trialEnd: null,
    });
    const result = convertToDatabaseSubscription(subscription);

    expect(result.currentPeriodEnd).toBeNull();
    expect(result.startedAt).toBeNull();
    expect(result.endedAt).toBeNull();
    expect(result.canceledAt).toBeNull();
    expect(result.endsAt).toBeNull();
    expect(result.trialStart).toBeNull();
    expect(result.trialEnd).toBeNull();
  });

  it("converts canceledAt and endsAt when present", () => {
    const subscription = createMockSubscription({
      canceledAt: new Date("2025-01-20T14:00:00Z"),
      endsAt: new Date("2025-02-15T10:00:00Z"),
    });
    const result = convertToDatabaseSubscription(subscription);

    expect(result.canceledAt).toBe("2025-01-20T14:00:00.000Z");
    expect(result.endsAt).toBe("2025-02-15T10:00:00.000Z");
  });

  it("converts trial dates when present", () => {
    const subscription = createMockSubscription({
      trialStart: new Date("2025-01-15T10:00:00Z"),
      trialEnd: new Date("2025-01-22T10:00:00Z"),
    });
    const result = convertToDatabaseSubscription(subscription);

    expect(result.trialStart).toBe("2025-01-15T10:00:00.000Z");
    expect(result.trialEnd).toBe("2025-01-22T10:00:00.000Z");
  });

  it("passes through discountId", () => {
    const subscription = createMockSubscription({
      discountId: "discount_xyz",
    });
    const result = convertToDatabaseSubscription(subscription);

    expect(result.discountId).toBe("discount_xyz");
  });

  it("passes through seats", () => {
    const subscription = createMockSubscription({ seats: 5 });
    const result = convertToDatabaseSubscription(subscription);

    expect(result.seats).toBe(5);
  });

  it("handles null seats", () => {
    const subscription = createMockSubscription({ seats: null });
    const result = convertToDatabaseSubscription(subscription);

    expect(result.seats).toBeNull();
  });

  it("handles undefined seats", () => {
    const subscription = createMockSubscription({ seats: undefined });
    const result = convertToDatabaseSubscription(subscription);

    expect(result.seats).toBeNull();
  });

  it("passes through recurringIntervalCount", () => {
    const subscription = createMockSubscription({
      recurringIntervalCount: 3,
    });
    const result = convertToDatabaseSubscription(subscription);

    expect(result.recurringIntervalCount).toBe(3);
  });

  it("passes through customFieldData", () => {
    const customData = { field1: "value1", field2: 123 };
    const subscription = createMockSubscription({
      customFieldData: customData,
    });
    const result = convertToDatabaseSubscription(subscription);

    expect(result.customFieldData).toEqual(customData);
  });

  it("passes through metadata", () => {
    const metadata = { key: "value" };
    const subscription = createMockSubscription({ metadata });
    const result = convertToDatabaseSubscription(subscription);

    expect(result.metadata).toEqual(metadata);
  });

  it("passes through cancellation reason and comment", () => {
    const subscription = createMockSubscription({
      customerCancellationReason: "too_expensive",
      customerCancellationComment: "Found a cheaper alternative",
    } as Partial<Subscription>);
    const result = convertToDatabaseSubscription(subscription);

    expect(result.customerCancellationReason).toBe("too_expensive");
    expect(result.customerCancellationComment).toBe(
      "Found a cheaper alternative",
    );
  });
});

describe("convertToDatabaseProduct", () => {
  it("converts all required fields correctly", () => {
    const product = createMockProduct();
    const result = convertToDatabaseProduct(product);

    expect(result.id).toBe("prod_123");
    expect(result.organizationId).toBe("org_456");
    expect(result.name).toBe("Test Product");
    expect(result.description).toBe("A test product");
    expect(result.isRecurring).toBe(true);
    expect(result.isArchived).toBe(false);
    expect(result.recurringInterval).toBe("month");
  });

  it("converts Date fields to ISO strings", () => {
    const product = createMockProduct();
    const result = convertToDatabaseProduct(product);

    expect(result.createdAt).toBe("2025-01-10T08:00:00.000Z");
    expect(result.modifiedAt).toBe("2025-01-12T09:00:00.000Z");
  });

  it("handles null modifiedAt", () => {
    const product = createMockProduct({ modifiedAt: null });
    const result = convertToDatabaseProduct(product);

    expect(result.modifiedAt).toBeNull();
  });

  it("passes through trial fields", () => {
    const product = createMockProduct({
      trialInterval: "day",
      trialIntervalCount: 14,
    } as Partial<Product>);
    const result = convertToDatabaseProduct(product);

    expect(result.trialInterval).toBe("day");
    expect(result.trialIntervalCount).toBe(14);
  });

  it("handles null trial fields", () => {
    const product = createMockProduct({
      trialInterval: null,
      trialIntervalCount: null,
    });
    const result = convertToDatabaseProduct(product);

    expect(result.trialInterval).toBeNull();
    expect(result.trialIntervalCount).toBeNull();
  });

  it("passes through recurringIntervalCount", () => {
    const product = createMockProduct({ recurringIntervalCount: 2 });
    const result = convertToDatabaseProduct(product);

    expect(result.recurringIntervalCount).toBe(2);
  });

  it("converts prices with fixed amount type", () => {
    const product = createMockProduct({
      prices: [
        {
          id: "price_123",
          productId: "prod_123",
          type: "recurring",
          amountType: "fixed",
          isArchived: false,
          createdAt: new Date("2025-01-10T08:00:00Z"),
          modifiedAt: null,
          recurringInterval: "month",
          priceAmount: 1000,
          priceCurrency: "usd",
        },
      ],
    } as Partial<Product>);
    const result = convertToDatabaseProduct(product);

    expect(result.prices).toHaveLength(1);
    expect(result.prices[0].id).toBe("price_123");
    expect(result.prices[0].amountType).toBe("fixed");
    expect(result.prices[0].priceAmount).toBe(1000);
    expect(result.prices[0].priceCurrency).toBe("usd");
    expect(result.prices[0].recurringInterval).toBe("month");
    expect(result.prices[0].createdAt).toBe("2025-01-10T08:00:00.000Z");
  });

  it("converts prices with custom amount type", () => {
    const product = createMockProduct({
      prices: [
        {
          id: "price_456",
          productId: "prod_123",
          type: "one_time",
          amountType: "custom",
          isArchived: false,
          createdAt: new Date("2025-01-10T08:00:00Z"),
          modifiedAt: null,
          priceCurrency: "usd",
          minimumAmount: 500,
          maximumAmount: 10000,
          presetAmount: 2000,
        },
      ],
    } as Partial<Product>);
    const result = convertToDatabaseProduct(product);

    expect(result.prices[0].amountType).toBe("custom");
    expect(result.prices[0].minimumAmount).toBe(500);
    expect(result.prices[0].maximumAmount).toBe(10000);
    expect(result.prices[0].presetAmount).toBe(2000);
    expect(result.prices[0].priceCurrency).toBe("usd");
    // recurringInterval should be undefined for non-recurring type
    expect(result.prices[0].recurringInterval).toBeUndefined();
  });

  it("converts medias correctly", () => {
    const product = createMockProduct({
      medias: [
        {
          id: "media_123",
          organizationId: "org_456",
          name: "product-image.png",
          path: "/images/product-image.png",
          mimeType: "image/png",
          size: 12345,
          storageVersion: "v1",
          checksumEtag: "abc123",
          checksumSha256Base64: "base64hash",
          checksumSha256Hex: "hexhash",
          createdAt: new Date("2025-01-10T08:00:00Z"),
          lastModifiedAt: new Date("2025-01-11T09:00:00Z"),
          version: "1",
          isUploaded: true,
          sizeReadable: "12.3 KB",
          publicUrl: "https://example.com/image.png",
        },
      ],
    } as Partial<Product>);
    const result = convertToDatabaseProduct(product);

    expect(result.medias).toHaveLength(1);
    expect(result.medias[0].id).toBe("media_123");
    expect(result.medias[0].name).toBe("product-image.png");
    expect(result.medias[0].createdAt).toBe("2025-01-10T08:00:00.000Z");
    expect(result.medias[0].lastModifiedAt).toBe("2025-01-11T09:00:00.000Z");
    expect(result.medias[0].publicUrl).toBe("https://example.com/image.png");
  });

  it("handles media with null lastModifiedAt", () => {
    const product = createMockProduct({
      medias: [
        {
          id: "media_123",
          organizationId: "org_456",
          name: "product-image.png",
          path: "/images/product-image.png",
          mimeType: "image/png",
          size: 12345,
          storageVersion: null,
          checksumEtag: null,
          checksumSha256Base64: null,
          checksumSha256Hex: null,
          createdAt: new Date("2025-01-10T08:00:00Z"),
          lastModifiedAt: null,
          version: null,
          isUploaded: true,
          sizeReadable: "12.3 KB",
          publicUrl: "https://example.com/image.png",
        },
      ],
    } as Partial<Product>);
    const result = convertToDatabaseProduct(product);

    expect(result.medias[0].lastModifiedAt).toBeNull();
  });

  it("passes through metadata", () => {
    const metadata = { category: "premium" };
    const product = createMockProduct({ metadata });
    const result = convertToDatabaseProduct(product);

    expect(result.metadata).toEqual(metadata);
  });

  it("handles empty prices and medias arrays", () => {
    const product = createMockProduct({
      prices: [],
      medias: [],
    });
    const result = convertToDatabaseProduct(product);

    expect(result.prices).toEqual([]);
    expect(result.medias).toEqual([]);
  });
});
