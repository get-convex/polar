import { describe, expect, test, vi } from "vitest";
import { Polar } from "./index.js";
import { defineSchema } from "convex/server";
import { defineTestApp } from "convex-test";
import componentTest from "../test.js";

const polarSdkMocks = vi.hoisted(() => ({
  checkoutsCreate: vi.fn(),
  customersList: vi.fn(),
}));

vi.mock("@polar-sh/sdk/funcs/checkoutsCreate.js", () => ({
  checkoutsCreate: polarSdkMocks.checkoutsCreate,
}));

vi.mock("@polar-sh/sdk/funcs/customersList.js", () => ({
  customersList: polarSdkMocks.customersList,
}));

const app = defineTestApp({
  schema: defineSchema({}),
  components: {
    polar: componentTest,
  },
});

const polar = new Polar(app.components.polar, {
  getUserInfo: async () => ({
    userId: "user_123",
    email: "test@example.com",
  }),
});

const { api, createTest } = app.defineModules({
  checkout: {
    generateCheckoutLink: polar.api().generateCheckoutLink,
  },
});

describe("generateCheckoutLink", () => {
  test("appends locale as query param if provided", async () => {
    polarSdkMocks.customersList.mockResolvedValue({
      ok: true,
      value: { result: { items: [{ id: "cust_123" }] } },
    });
    polarSdkMocks.checkoutsCreate.mockResolvedValue({
      ok: true,
      value: { url: "https://checkout.polar.sh/session?foo=bar" },
    });

    const t = createTest();
    const result = await t.action(api.checkout.generateCheckoutLink, {
      productIds: ["prod_1"],
      origin: "https://example.com",
      successUrl: "https://example.com/success",
      locale: "fr",
    });

    expect(result.url).toContain("locale=fr");
    expect(result.url).toMatch(/^https:\/\//);
  });

  test("does not append locale if not provided", async () => {
    polarSdkMocks.customersList.mockResolvedValue({
      ok: true,
      value: { result: { items: [{ id: "cust_123" }] } },
    });
    polarSdkMocks.checkoutsCreate.mockResolvedValue({
      ok: true,
      value: { url: "https://checkout.polar.sh/session?foo=bar" },
    });

    const t = createTest();
    const result = await t.action(api.checkout.generateCheckoutLink, {
      productIds: ["prod_1"],
      origin: "https://example.com",
      successUrl: "https://example.com/success",
    });

    expect(result.url).not.toContain("locale=");
    expect(result.url).toMatch(/^https:\/\//);
  });
});
