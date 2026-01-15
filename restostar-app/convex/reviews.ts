import { v } from "convex/values";

import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { requireIdentity } from "./lib/auth";
import { generateCouponCode, normalizeSlug } from "./lib/strings";

export const submitReview = mutation({
  args: {
    publicId: v.string(),
    slug: v.string(),
    stars: v.number(),
    feedbackText: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const stars = Math.max(1, Math.min(5, Math.floor(args.stars)));

    const restaurant = await ctx.db
      .query("restaurants")
      .withIndex("by_publicId_slug", (q) =>
        q.eq("publicId", args.publicId).eq("slug", normalizeSlug(args.slug))
      )
      .unique();

    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    const reviewId = await ctx.db.insert("reviews", {
      restaurantId: restaurant._id,
      stars,
      feedbackText: args.feedbackText?.trim() || undefined,
      isPublic: stars >= 4,
      createdAt: Date.now(),
    });

    let couponCode: string | null = null;

    if (args.email) {
      const normalizedEmail = args.email.trim().toLowerCase();
      if (!normalizedEmail.includes("@")) {
        throw new Error("Invalid email");
      }

      // Check if this email already received a coupon for this restaurant
      const existingCoupon = await ctx.db
        .query("customerCoupons")
        .withIndex("by_restaurantId_email", (q) =>
          q.eq("restaurantId", restaurant._id).eq("email", normalizedEmail)
        )
        .first();

      if (existingCoupon) {
        return {
          reviewId,
          couponCode: null,
          alreadyReceivedCoupon: true,
          existingCouponCode: existingCoupon.couponCode,
        };
      }

      // Generate a unique coupon code.
      for (let i = 0; i < 5; i++) {
        const candidate = generateCouponCode();
        const collision = await ctx.db
          .query("customerCoupons")
          .withIndex("by_couponCode", (q) => q.eq("couponCode", candidate))
          .unique();

        if (!collision) {
          couponCode = candidate;
          break;
        }
      }

      if (!couponCode) {
        throw new Error("Failed to generate coupon code");
      }

      await ctx.db.insert("customerCoupons", {
        reviewId,
        restaurantId: restaurant._id,
        email: normalizedEmail,
        couponCode,
        isRedeemed: false,
        redeemedAt: undefined,
        sentAt: Date.now(),
      });

      const sentimentType = stars >= 4 ? "positive" : "negative";
      const couponConfig = await ctx.db
        .query("coupons")
        .withIndex("by_restaurantId_sentiment", (q) =>
          q.eq("restaurantId", restaurant._id).eq("sentimentType", sentimentType)
        )
        .unique();

      // Fire-and-forget email sending.
      // For negative reviews, use AI-generated sympathetic email
      if (sentimentType === "negative") {
        await ctx.scheduler.runAfter(0, internal.email.sendNegativeCouponEmail, {
          to: normalizedEmail,
          restaurantName: restaurant.name,
          couponCode,
          customerFeedback: args.feedbackText?.trim() || undefined,
          offerTitle: couponConfig?.title,
          offerDiscountValue: couponConfig?.discountValue,
        });
      } else {
        await ctx.scheduler.runAfter(0, internal.email.sendCouponEmail, {
          to: normalizedEmail,
          restaurantName: restaurant.name,
          couponCode,
          sentimentType,
          googleMapsUrl: restaurant.googleMapsUrl,
          offerTitle: couponConfig?.title,
          offerDiscountValue: couponConfig?.discountValue,
        });
      }
    }

    return { reviewId, couponCode, alreadyReceivedCoupon: false, existingCouponCode: null };
  },
});

export const listReviews = query({
  args: {
    restaurantId: v.id("restaurants"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const clerkUserId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");
    if (restaurant.ownerId !== user._id) throw new Error("Unauthorized");

    const limit = Math.max(1, Math.min(200, args.limit ?? 50));

    return await ctx.db
      .query("reviews")
      .withIndex("by_restaurantId_createdAt", (q) =>
        q.eq("restaurantId", restaurant._id)
      )
      .order("desc")
      .take(limit);
  },
});
