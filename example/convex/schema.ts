import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
  }),
  todos: defineTable({
    userId: v.id("users"),
    text: v.string(),
    completed: v.boolean(),
  }).index("userId", ["userId"]),
});
