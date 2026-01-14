import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { requireClerkUserId, requireIdentity } from "./lib/auth";

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const clerkUserId = await requireClerkUserId(ctx);

    return await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
  },
});

export const upsertMe = mutation({
  args: {
    // Allow overriding name/email in the future (e.g. owner profile edits).
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const clerkUserId = identity.subject;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    const name = args.name ?? identity.name ?? undefined;
    const email = args.email ?? identity.email ?? undefined;

    if (existing) {
      await ctx.db.patch(existing._id, {
        name,
        email,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkUserId,
      name,
      email,
      createdAt: Date.now(),
    });
  },
});
