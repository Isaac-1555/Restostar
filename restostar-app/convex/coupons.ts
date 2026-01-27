import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { requireIdentity } from "./lib/auth";

export const getCouponsForRestaurant = query({
  args: {
    restaurantId: v.id("restaurants"),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const clerkUserId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (!user) throw new Error("User not found");

    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");
    if (restaurant.ownerId !== user._id) throw new Error("Unauthorized");

    return await ctx.db
      .query("coupons")
      .withIndex("by_restaurantId_sentiment", (q) =>
        q.eq("restaurantId", restaurant._id)
      )
      .collect();
  },
});

export const setCoupon = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    sentimentType: v.union(v.literal("positive"), v.literal("negative")),
    title: v.string(),
    description: v.optional(v.string()),
    discountValue: v.string(),
    isSingleUse: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const clerkUserId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (!user) throw new Error("User not found");

    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");
    if (restaurant.ownerId !== user._id) throw new Error("Unauthorized");

    const title = args.title.trim();
    if (!title) throw new Error("Coupon title is required");

    const discountValue = args.discountValue.trim();
    if (!discountValue) throw new Error("Coupon reward is required");

    const description = args.description?.trim() || undefined;

    const existing = await ctx.db
      .query("coupons")
      .withIndex("by_restaurantId_sentiment", (q) =>
        q.eq("restaurantId", restaurant._id).eq("sentimentType", args.sentimentType)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title,
        description,
        discountValue,
        isSingleUse: args.isSingleUse,
      });
      return existing._id;
    }

    return await ctx.db.insert("coupons", {
      restaurantId: restaurant._id,
      sentimentType: args.sentimentType,
      title,
      description,
      discountValue,
      isSingleUse: args.isSingleUse,
      createdAt: Date.now(),
    });
  },
});

export const redeemCoupon = mutation({
  args: {
    couponCode: v.string(),
  },
  handler: async (ctx, args) => {
    const code = args.couponCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{6,12}$/.test(code)) {
      throw new Error("Invalid coupon code");
    }

    const customerCoupon = await ctx.db
      .query("customerCoupons")
      .withIndex("by_couponCode", (q) => q.eq("couponCode", code))
      .unique();

    if (!customerCoupon) {
      throw new Error("Invalid coupon code");
    }

    const review = await ctx.db.get(customerCoupon.reviewId);
    const restaurant = await ctx.db.get(customerCoupon.restaurantId);

    const sentimentType = review
      ? review.stars >= 4
        ? ("positive" as const)
        : ("negative" as const)
      : null;

    const couponConfig =
      sentimentType && restaurant
        ? await ctx.db
            .query("coupons")
            .withIndex("by_restaurantId_sentiment", (q) =>
              q.eq("restaurantId", restaurant._id).eq("sentimentType", sentimentType)
            )
            .unique()
        : null;

    const responseBase = {
      restaurantName: restaurant?.name ?? null,
      sentimentType,
      offerTitle: couponConfig?.title ?? null,
      offerDiscountValue: couponConfig?.discountValue ?? null,
    };

    if (customerCoupon.isRedeemed) {
      return {
        status: "already_redeemed" as const,
        redeemedAt: customerCoupon.redeemedAt ?? null,
        ...responseBase,
      };
    }

    const redeemedAt = Date.now();
    await ctx.db.patch(customerCoupon._id, {
      isRedeemed: true,
      redeemedAt,
    });

    return {
      status: "redeemed" as const,
      redeemedAt,
      ...responseBase,
    };
  },
});

// Owner verification query - verify coupon status without redeeming
export const verifyCouponForOwner = query({
  args: {
    couponCode: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const clerkUserId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (!user) throw new Error("User not found");

    const code = args.couponCode.trim().toUpperCase();
    if (!code) {
      return { status: "invalid" as const, message: "Please enter a coupon code" };
    }

    if (!/^[A-Z0-9]{6,12}$/.test(code)) {
      return { status: "invalid" as const, message: "Invalid coupon code format" };
    }

    const customerCoupon = await ctx.db
      .query("customerCoupons")
      .withIndex("by_couponCode", (q) => q.eq("couponCode", code))
      .unique();

    if (!customerCoupon) {
      return { status: "not_found" as const, message: "Coupon code not found in the system" };
    }

    const restaurant = await ctx.db.get(customerCoupon.restaurantId);
    if (!restaurant) {
      return { status: "invalid" as const, message: "Restaurant not found" };
    }

    // Check if this coupon belongs to one of the owner's restaurants
    if (restaurant.ownerId !== user._id) {
      return { status: "unauthorized" as const, message: "This coupon is not for your restaurant" };
    }

    const review = await ctx.db.get(customerCoupon.reviewId);
    const sentimentType = review
      ? review.stars >= 4
        ? ("positive" as const)
        : ("negative" as const)
      : null;

    const couponConfig =
      sentimentType
        ? await ctx.db
            .query("coupons")
            .withIndex("by_restaurantId_sentiment", (q) =>
              q.eq("restaurantId", restaurant._id).eq("sentimentType", sentimentType)
            )
            .unique()
        : null;

    return {
      status: customerCoupon.isRedeemed ? "already_redeemed" as const : "valid" as const,
      couponCode: code,
      restaurantName: restaurant.name,
      customerEmail: customerCoupon.email,
      sentimentType,
      offerTitle: couponConfig?.title ?? null,
      offerDiscountValue: couponConfig?.discountValue ?? null,
      isRedeemed: customerCoupon.isRedeemed,
      redeemedAt: customerCoupon.redeemedAt ?? null,
      sentAt: customerCoupon.sentAt,
      reviewStars: review?.stars ?? null,
    };
  },
});

// Owner can also redeem coupons from their dashboard
export const redeemCouponAsOwner = mutation({
  args: {
    couponCode: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const clerkUserId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (!user) throw new Error("User not found");

    const code = args.couponCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{6,12}$/.test(code)) {
      throw new Error("Invalid coupon code format");
    }

    const customerCoupon = await ctx.db
      .query("customerCoupons")
      .withIndex("by_couponCode", (q) => q.eq("couponCode", code))
      .unique();

    if (!customerCoupon) {
      throw new Error("Coupon code not found");
    }

    const restaurant = await ctx.db.get(customerCoupon.restaurantId);
    if (!restaurant || restaurant.ownerId !== user._id) {
      throw new Error("This coupon is not for your restaurant");
    }

    if (customerCoupon.isRedeemed) {
      throw new Error("This coupon has already been redeemed");
    }

    const redeemedAt = Date.now();
    await ctx.db.patch(customerCoupon._id, {
      isRedeemed: true,
      redeemedAt,
    });

    return { success: true, redeemedAt };
  },
});
