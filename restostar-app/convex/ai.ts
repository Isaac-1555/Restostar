import { v } from "convex/values";

import { api, internal } from "./_generated/api";
import { action, internalMutation, query } from "./_generated/server";
import { requireIdentity } from "./lib/auth";

type TimeRange = "daily" | "monthly" | "all";

export const getInsights = query({
  args: {
    restaurantId: v.id("restaurants"),
    timeRange: v.union(v.literal("daily"), v.literal("monthly"), v.literal("all")),
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
      .query("aiInsights")
      .withIndex("by_restaurantId_timeRange", (q) =>
        q.eq("restaurantId", restaurant._id).eq("timeRange", args.timeRange)
      )
      .unique();
  },
});

export const saveInsights = internalMutation({
  args: {
    restaurantId: v.id("restaurants"),
    timeRange: v.union(v.literal("daily"), v.literal("monthly"), v.literal("all")),
    sentimentSummary: v.string(),
    keyComplaints: v.array(v.string()),
    suggestions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("aiInsights")
      .withIndex("by_restaurantId_timeRange", (q) =>
        q.eq("restaurantId", args.restaurantId).eq("timeRange", args.timeRange)
      )
      .unique();

    const payload = {
      sentimentSummary: args.sentimentSummary,
      keyComplaints: args.keyComplaints,
      suggestions: args.suggestions,
      generatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }

    return await ctx.db.insert("aiInsights", {
      restaurantId: args.restaurantId,
      timeRange: args.timeRange,
      ...payload,
    });
  },
});

export const generateInsights = action({
  args: {
    restaurantId: v.id("restaurants"),
    timeRange: v.union(v.literal("daily"), v.literal("monthly"), v.literal("all")),
  },
  handler: async (ctx, args) => {
    const geminiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

    if (!geminiKey) {
      throw new Error("Missing Convex env var: GEMINI_API_KEY");
    }

    // Auth + authorization: ensure the restaurant belongs to the signed-in owner.
    const restaurants = await ctx.runQuery(api.restaurants.listMyRestaurants, {});
    const restaurant = restaurants.find((r) => r._id === args.restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");

    const allReviews = await ctx.runQuery(api.reviews.listReviews, {
      restaurantId: args.restaurantId,
      limit: 200,
    });

    const now = Date.now();
    const since = (() => {
      switch (args.timeRange as TimeRange) {
        case "daily":
          return now - 24 * 60 * 60 * 1000;
        case "monthly":
          return now - 30 * 24 * 60 * 60 * 1000;
        case "all":
          return 0;
      }
    })();

    const reviews = since ? allReviews.filter((r) => r.createdAt >= since) : allReviews;

    const reviewLines = reviews
      .slice(0, 120)
      .map((r) => {
        const text = (r.feedbackText ?? "").trim();
        return `${r.stars}★ ${text}`.trim();
      })
      .filter((l) => l.length > 0);

    const prompt = [
      "You analyze restaurant customer feedback.",
      "Return JSON only (no markdown, no code fences) with keys:",
      "- sentimentSummary: string (short paragraph)",
      "- keyComplaints: string[] (max 5)",
      "- suggestions: string[] (max 5, actionable)",
      "",
      `Restaurant: ${restaurant.name}`,
      `Time range: ${args.timeRange}`,
      "",
      "Reviews:",
      ...reviewLines,
    ].join("\n");

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gemini error: ${res.status} ${text}`);
    }

    const data = await res.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content || typeof content !== "string") {
      throw new Error("Unexpected Gemini response");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("Failed to parse Gemini JSON response");
    }

    const parsedObj: Record<string, unknown> =
      typeof parsed === "object" && parsed !== null
        ? (parsed as Record<string, unknown>)
        : {};

    const sentimentSummary =
      typeof parsedObj.sentimentSummary === "string"
        ? parsedObj.sentimentSummary.trim()
        : "";

    const keyComplaints = Array.isArray(parsedObj.keyComplaints)
      ? parsedObj.keyComplaints.map((x) => String(x)).slice(0, 5)
      : [];

    const suggestions = Array.isArray(parsedObj.suggestions)
      ? parsedObj.suggestions.map((x) => String(x)).slice(0, 5)
      : [];

    if (!sentimentSummary) {
      throw new Error("Gemini response missing sentimentSummary");
    }

    await ctx.runMutation(internal.ai.saveInsights, {
      restaurantId: args.restaurantId,
      timeRange: args.timeRange,
      sentimentSummary,
      keyComplaints,
      suggestions,
    });

    return { ok: true };
  },
});
