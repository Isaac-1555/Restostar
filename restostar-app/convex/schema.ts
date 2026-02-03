import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_clerkUserId", ["clerkUserId"]),

  restaurants: defineTable({
    ownerId: v.id("users"),
    publicId: v.string(),
    slug: v.string(),

    name: v.string(),
    logoUrl: v.optional(v.string()),
    googleMapsUrl: v.string(),

    emailTone: v.union(v.literal("assist"), v.literal("manual")),
    createdAt: v.number(),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_ownerId_slug", ["ownerId", "slug"])
    .index("by_publicId", ["publicId"])
    .index("by_publicId_slug", ["publicId", "slug"]),

  coupons: defineTable({
    restaurantId: v.id("restaurants"),
    sentimentType: v.union(v.literal("positive"), v.literal("negative")),

    title: v.string(),
    description: v.optional(v.string()),
    discountValue: v.string(),
    isSingleUse: v.boolean(),

    // How long after the customer submits the flow before sending the coupon email.
    // Optional for backward compatibility with existing records.
    sendDelayMinutes: v.optional(
      v.union(v.literal(0), v.literal(1), v.literal(2), v.literal(5))
    ),

    createdAt: v.number(),
  }).index("by_restaurantId_sentiment", ["restaurantId", "sentimentType"]),

  reviews: defineTable({
    restaurantId: v.id("restaurants"),
    stars: v.number(),
    feedbackText: v.optional(v.string()),
    positiveCategories: v.optional(v.array(v.string())),
    isPublic: v.boolean(),
    createdAt: v.number(),
  }).index("by_restaurantId_createdAt", ["restaurantId", "createdAt"]),

  customerCoupons: defineTable({
    reviewId: v.id("reviews"),
    restaurantId: v.id("restaurants"),

    email: v.string(),
    couponCode: v.string(),
    isRedeemed: v.boolean(),
    redeemedAt: v.optional(v.number()),

    // Scheduling + delivery timestamps (optional for backward compatibility).
    createdAt: v.optional(v.number()),
    scheduledFor: v.optional(v.number()),
    sentAt: v.optional(v.number()),
  })
    .index("by_couponCode", ["couponCode"])
    .index("by_reviewId", ["reviewId"])
    .index("by_restaurantId", ["restaurantId"])
    .index("by_restaurantId_email", ["restaurantId", "email"]),

  aiInsights: defineTable({
    restaurantId: v.id("restaurants"),
    timeRange: v.union(v.literal("daily"), v.literal("monthly"), v.literal("all")),

    sentimentSummary: v.string(),
    keyComplaints: v.array(v.string()),
    suggestions: v.array(v.string()),
    generatedAt: v.number(),
  }).index("by_restaurantId_timeRange", ["restaurantId", "timeRange"]),
});
