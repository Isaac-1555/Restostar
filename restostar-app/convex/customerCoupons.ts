import { v } from "convex/values";

import { internalMutation } from "./_generated/server";

export const markCouponEmailSent = internalMutation({
  args: {
    customerCouponId: v.id("customerCoupons"),
    sentAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.customerCouponId);
    if (!existing) return null;

    await ctx.db.patch(args.customerCouponId, {
      sentAt: args.sentAt,
    });

    return args.customerCouponId;
  },
});
