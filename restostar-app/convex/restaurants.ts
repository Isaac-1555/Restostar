import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { requireIdentity } from "./lib/auth";
import { generatePublicId, normalizeSlug } from "./lib/strings";

export const getRestaurantPublic = query({
  args: {
    publicId: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db
      .query("restaurants")
      .withIndex("by_publicId_slug", (q) =>
        q.eq("publicId", args.publicId).eq("slug", normalizeSlug(args.slug))
      )
      .unique();

    if (!restaurant) return null;

    return {
      publicId: restaurant.publicId,
      slug: restaurant.slug,
      name: restaurant.name,
      logoUrl: restaurant.logoUrl,
      googleMapsUrl: restaurant.googleMapsUrl,
    };
  },
});

export const listMyRestaurants = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const clerkUserId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("restaurants")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
      .collect();
  },
});

export const createRestaurant = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    googleMapsUrl: v.string(),
    emailTone: v.union(v.literal("assist"), v.literal("manual")),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const clerkUserId = identity.subject;

    // Ensure we have a user row.
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (!user) {
      const userId = await ctx.db.insert("users", {
        clerkUserId,
        name: identity.name ?? undefined,
        email: identity.email ?? undefined,
        createdAt: Date.now(),
      });
      user = await ctx.db.get(userId);
    }

    if (!user) {
      throw new Error("Failed to create user");
    }

    const name = args.name.trim();
    if (!name) {
      throw new Error("Restaurant name is required");
    }

    const googleMapsUrl = args.googleMapsUrl.trim();
    if (!googleMapsUrl) {
      throw new Error("Google Maps URL is required");
    }
    if (!/^https?:\/\//.test(googleMapsUrl)) {
      throw new Error("Google Maps URL must start with http(s)://");
    }

    const slug = normalizeSlug(args.slug);
    if (!slug) {
      throw new Error("Invalid slug");
    }

    const existingSlug = await ctx.db
      .query("restaurants")
      .withIndex("by_ownerId_slug", (q) => q.eq("ownerId", user._id).eq("slug", slug))
      .unique();

    if (existingSlug) {
      throw new Error("Slug already in use");
    }

    // Generate a publicId that is stable for QR URLs.
    let publicId: string | null = null;
    for (let i = 0; i < 5; i++) {
      const candidate = generatePublicId();
      const collision = await ctx.db
        .query("restaurants")
        .withIndex("by_publicId", (q) => q.eq("publicId", candidate))
        .unique();

      if (!collision) {
        publicId = candidate;
        break;
      }
    }

    if (!publicId) {
      throw new Error("Failed to generate public id");
    }

    const restaurantId = await ctx.db.insert("restaurants", {
      ownerId: user._id,
      publicId,
      slug,
      name,
      logoUrl: args.logoUrl,
      googleMapsUrl,
      emailTone: args.emailTone,
      createdAt: Date.now(),
    });

    return { restaurantId, publicId, slug };
  },
});

export const updateRestaurant = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    googleMapsUrl: v.optional(v.string()),
    emailTone: v.optional(v.union(v.literal("assist"), v.literal("manual"))),
    logoUrl: v.optional(v.string()),
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
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    if (restaurant.ownerId !== user._id) {
      throw new Error("Unauthorized");
    }

    const patch: Record<string, unknown> = {};

    if (args.name !== undefined) {
      const name = args.name.trim();
      if (!name) throw new Error("Restaurant name is required");
      patch.name = name;
    }

    if (args.googleMapsUrl !== undefined) {
      const googleMapsUrl = args.googleMapsUrl.trim();
      if (!googleMapsUrl) throw new Error("Google Maps URL is required");
      if (!/^https?:\/\//.test(googleMapsUrl)) {
        throw new Error("Google Maps URL must start with http(s)://");
      }
      patch.googleMapsUrl = googleMapsUrl;
    }

    if (args.emailTone !== undefined) patch.emailTone = args.emailTone;
    if (args.logoUrl !== undefined) patch.logoUrl = args.logoUrl;

    if (args.slug !== undefined) {
      const slug = normalizeSlug(args.slug);
      if (!slug) throw new Error("Invalid slug");

      const existingSlug = await ctx.db
        .query("restaurants")
        .withIndex("by_ownerId_slug", (q) =>
          q.eq("ownerId", user._id).eq("slug", slug)
        )
        .unique();

      if (existingSlug && existingSlug._id !== restaurant._id) {
        throw new Error("Slug already in use");
      }

      patch.slug = slug;
    }

    await ctx.db.patch(restaurant._id, patch);
    return restaurant._id;
  },
});
