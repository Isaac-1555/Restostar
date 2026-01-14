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
    const openaiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

    if (!openaiKey) {
      throw new Error("Missing Convex env var: OPENAI_API_KEY");
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
      "Return JSON only with keys:",
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

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI error: ${res.status} ${text}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("Unexpected OpenAI response");
    }

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("Failed to parse OpenAI JSON response");
    }

    const sentimentSummary = String(parsed.sentimentSummary ?? "").trim();
    const keyComplaints = Array.isArray(parsed.keyComplaints)
      ? parsed.keyComplaints.map((x: any) => String(x)).slice(0, 5)
      : [];
    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions.map((x: any) => String(x)).slice(0, 5)
      : [];

    if (!sentimentSummary) {
      throw new Error("OpenAI response missing sentimentSummary");
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
