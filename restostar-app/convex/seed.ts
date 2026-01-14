import { mutation } from "./_generated/server";

/**
 * Seeds the database with a demo restaurant for testing the QR review flow.
 * Run this from the Convex dashboard or via `npx convex run seed:seedDemoRestaurant`
 */
export const seedDemoRestaurant = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if demo restaurant already exists
    const existing = await ctx.db
      .query("restaurants")
      .withIndex("by_publicId_slug", (q) =>
        q.eq("publicId", "demo").eq("slug", "demo")
      )
      .unique();

    if (existing) {
      return { message: "Demo restaurant already exists", restaurantId: existing._id };
    }

    // Create a system user for the demo restaurant
    let demoUser = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", "demo_system_user"))
      .unique();

    if (!demoUser) {
      const userId = await ctx.db.insert("users", {
        clerkUserId: "demo_system_user",
        name: "Demo User",
        email: "demo@restostar.local",
        createdAt: Date.now(),
      });
      demoUser = await ctx.db.get(userId);
    }

    if (!demoUser) {
      throw new Error("Failed to create demo user");
    }

    // Create the demo restaurant
    const restaurantId = await ctx.db.insert("restaurants", {
      ownerId: demoUser._id,
      publicId: "demo",
      slug: "demo",
      name: "Restostar",
      googleMapsUrl: "https://maps.google.com/?cid=demo",
      emailTone: "assist",
      createdAt: Date.now(),
    });

    return { message: "Demo restaurant created", restaurantId };
  },
});
