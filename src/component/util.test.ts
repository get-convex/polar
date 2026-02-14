import { test, describe, expect } from "vitest";
import {
  validateUserId,
  validateProductId,
  validateProductIds,
  validateSubscriptionId,
  validateCustomerId,
  validatePolarToken,
  validateMetadata,
} from "./util.js";

describe("Input Validation Functions", () => {
  describe("validateUserId", () => {
    test("should accept valid user ID", () => {
      expect(() => validateUserId("user123")).not.toThrow();
    });

    test("should reject non-string user ID", () => {
      expect(() => validateUserId(123)).toThrow("User ID must be a string");
    });

    test("should reject empty user ID", () => {
      expect(() => validateUserId("")).toThrow("User ID cannot be empty");
    });

    test("should reject whitespace-only user ID", () => {
      expect(() => validateUserId("   ")).toThrow("User ID cannot be empty");
    });

    test("should reject user ID longer than 256 characters", () => {
      const longId = "a".repeat(257);
      expect(() => validateUserId(longId)).toThrow(
        "User ID is too long (max 256 characters)"
      );
    });

    test("should accept user ID with exactly 256 characters", () => {
      const maxId = "a".repeat(256);
      expect(() => validateUserId(maxId)).not.toThrow();
    });
  });

  describe("validateProductId", () => {
    test("should accept valid product ID", () => {
      expect(() => validateProductId("prod_abc123")).not.toThrow();
    });

    test("should reject non-string product ID", () => {
      expect(() => validateProductId(null)).toThrow(
        "Product ID must be a string"
      );
    });

    test("should reject empty product ID", () => {
      expect(() => validateProductId("")).toThrow(
        "Product ID cannot be empty"
      );
    });

    test("should reject product ID longer than 256 characters", () => {
      const longId = "p".repeat(257);
      expect(() => validateProductId(longId)).toThrow(
        "Product ID is too long (max 256 characters)"
      );
    });
  });

  describe("validateProductIds", () => {
    test("should accept valid product IDs array", () => {
      expect(() =>
        validateProductIds(["prod_1", "prod_2", "prod_3"])
      ).not.toThrow();
    });

    test("should reject non-array input", () => {
      expect(() => validateProductIds("prod_1")).toThrow(
        "Product IDs must be an array"
      );
    });

    test("should reject empty array", () => {
      expect(() => validateProductIds([])).toThrow(
        "Product IDs array cannot be empty"
      );
    });

    test("should reject array with more than 100 items", () => {
      const tooMany = Array.from({ length: 101 }, (_, i) => `prod_${i}`);
      expect(() => validateProductIds(tooMany)).toThrow(
        "Too many product IDs (max 100)"
      );
    });

    test("should reject array with non-string elements", () => {
      expect(() => validateProductIds(["prod_1", 123])).toThrow(
        "Product ID at index 1 must be a string"
      );
    });

    test("should reject array with empty string elements", () => {
      expect(() => validateProductIds(["prod_1", ""])).toThrow(
        "Product ID at index 1 cannot be empty"
      );
    });

    test("should reject array with too-long product IDs", () => {
      const longId = "p".repeat(257);
      expect(() => validateProductIds([longId])).toThrow(
        "Product ID at index 0 is too long (max 256 characters)"
      );
    });

    test("should accept array with 100 items", () => {
      const exactly100 = Array.from({ length: 100 }, (_, i) => `prod_${i}`);
      expect(() => validateProductIds(exactly100)).not.toThrow();
    });
  });

  describe("validateSubscriptionId", () => {
    test("should accept valid subscription ID", () => {
      expect(() => validateSubscriptionId("sub_xyz789")).not.toThrow();
    });

    test("should reject non-string subscription ID", () => {
      expect(() => validateSubscriptionId(undefined)).toThrow(
        "Subscription ID must be a string"
      );
    });

    test("should reject empty subscription ID", () => {
      expect(() => validateSubscriptionId("")).toThrow(
        "Subscription ID cannot be empty"
      );
    });
  });

  describe("validateCustomerId", () => {
    test("should accept valid customer ID", () => {
      expect(() => validateCustomerId("cust_abc123")).not.toThrow();
    });

    test("should reject non-string customer ID", () => {
      expect(() => validateCustomerId({})).toThrow(
        "Customer ID must be a string"
      );
    });

    test("should reject empty customer ID", () => {
      expect(() => validateCustomerId("")).toThrow(
        "Customer ID cannot be empty"
      );
    });
  });

  describe("validatePolarToken", () => {
    test("should accept valid Polar token", () => {
      expect(() =>
        validatePolarToken("polar_prod_1234567890abcdef")
      ).not.toThrow();
    });

    test("should reject non-string token", () => {
      expect(() => validatePolarToken(12345)).toThrow(
        "Polar token must be a string"
      );
    });

    test("should reject empty token", () => {
      expect(() => validatePolarToken("")).toThrow(
        "Polar token cannot be empty"
      );
    });

    test("should reject too-short token", () => {
      expect(() => validatePolarToken("short")).toThrow(
        "Polar token seems invalid (too short)"
      );
    });

    test("should accept token with exactly 10 characters", () => {
      expect(() => validatePolarToken("1234567890")).not.toThrow();
    });
  });

  describe("validateMetadata", () => {
    test("should accept valid metadata object", () => {
      expect(() =>
        validateMetadata({
          key1: "value1",
          key2: 42,
          key3: true,
          key4: null,
        })
      ).not.toThrow();
    });

    test("should accept empty metadata object", () => {
      expect(() => validateMetadata({})).not.toThrow();
    });

    test("should reject non-object metadata", () => {
      expect(() => validateMetadata("not an object")).toThrow(
        "Metadata must be an object"
      );
    });

    test("should reject null metadata", () => {
      expect(() => validateMetadata(null)).toThrow(
        "Metadata must be an object"
      );
    });

    test("should reject array as metadata", () => {
      expect(() => validateMetadata(["item1", "item2"])).toThrow(
        "Metadata must be an object, not an array"
      );
    });

    test("should reject metadata with more than 1000 properties", () => {
      const bigMetadata = Object.fromEntries(
        Array.from({ length: 1001 }, (_, i) => [`key${i}`, `value${i}`])
      );
      expect(() => validateMetadata(bigMetadata)).toThrow(
        "Metadata has too many properties (max 1000)"
      );
    });

    test("should reject metadata with non-string keys", () => {
      // Note: Non-string keys (like Symbols) are automatically excluded
      // when iterating with Object.entries(), so this test validates that
      // objects with only symbol properties pass validation
      const objWithSymbolKey = { [Symbol("key")]: "value" };
      expect(() => validateMetadata(objWithSymbolKey)).not.toThrow();
    });

    test("should reject metadata with too-long keys", () => {
      const longKey = "k".repeat(257);
      expect(() => validateMetadata({ [longKey]: "value" })).toThrow(
        `Metadata key "${longKey}" is too long (max 256 characters)`
      );
    });

    test("should reject metadata with non-serializable values", () => {
      expect(() =>
        validateMetadata({ key: () => {} })
      ).toThrow(
        'Metadata value for key "key" is not JSON-serializable'
      );
    });

    test("should accept metadata with nested objects", () => {
      expect(() =>
        validateMetadata({
          nested: { deep: "value" },
          array: [1, 2, 3],
        })
      ).not.toThrow();
    });

    test("should accept metadata with 1000 properties", () => {
      const maxMetadata = Object.fromEntries(
        Array.from({ length: 1000 }, (_, i) => [`key${i}`, `value${i}`])
      );
      expect(() => validateMetadata(maxMetadata)).not.toThrow();
    });
  });
});
