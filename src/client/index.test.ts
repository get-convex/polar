import { describe, it, expect } from "vitest";
import { Polar } from "./index";

// Mock dependencies
const mockGetUserInfo = async () => ({ userId: "user_123", email: "test@example.com" });
const mockCreateCheckoutSession = async (_ctx: any, _args: any) => ({ url: "https://checkout.polar.sh/session?foo=bar" });

// Minimal mock component
const mockComponent = {} as any;

describe("generateCheckoutLink", () => {
  it("appends locale as query param if provided", async () => {
    const polar = new Polar(mockComponent, { getUserInfo: mockGetUserInfo });
    polar.createCheckoutSession = mockCreateCheckoutSession;
    const api = polar.api();
    const result = await api.generateCheckoutLink({}, {
      productIds: ["prod_1"],
      origin: "https://example.com",
      successUrl: "https://example.com/success",
      locale: "fr",
    });
    expect(result.url).toContain("locale=fr");
    expect(result.url).toMatch(/^https:\/\//);
  });

  it("does not append locale if not provided", async () => {
    const polar = new Polar(mockComponent, { getUserInfo: mockGetUserInfo });
    polar.createCheckoutSession = mockCreateCheckoutSession;
    const api = polar.api();
    const result = await api.generateCheckoutLink({}, {
      productIds: ["prod_1"],
      origin: "https://example.com",
      successUrl: "https://example.com/success",
    });
    expect(result.url).not.toContain("locale=");
    expect(result.url).toMatch(/^https:\/\//);
  });
});
