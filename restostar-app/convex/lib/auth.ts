import type { MutationCtx, QueryCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

export async function requireIdentity(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity;
}

export async function requireClerkUserId(ctx: Ctx) {
  const identity = await requireIdentity(ctx);
  // Convex auth providers map the external user ID to `subject`.
  return identity.subject;
}
