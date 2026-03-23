/// <reference types="vite/client" />
import { test } from "vitest";
import { convexTest } from "convex-test";
import {
  componentsGeneric,
  defineSchema,
  type GenericSchema,
  type SchemaDefinition,
} from "convex/server";
import type { ComponentApi } from "../component/_generated/component.js";
import { register } from "../test.js";

export const modules = import.meta.glob("./**/*.*s");

export function initConvexTest<
  Schema extends SchemaDefinition<GenericSchema, boolean>,
>(schema?: Schema) {
  const t = convexTest(schema ?? defineSchema({}), modules);
  register(t);
  return t;
}

export const components = componentsGeneric() as unknown as {
  polar: ComponentApi;
};

test("setup", () => {});
