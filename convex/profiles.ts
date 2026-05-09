import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser } from "./lib/authz";
import { now } from "./lib/time";
import { assertLength } from "./lib/validators";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => requireCurrentUser(ctx),
});

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    return ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", user.userId)).unique();
  },
});

export const upsertProfile = mutation({
  args: { name: v.string(), email: v.string(), avatarUrl: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const timestamp = now();
    const name = assertLength(args.name, 2, 80, "Name");
    const email = assertLength(args.email.toLowerCase().trim(), 3, 160, "Email");
    const existing = await ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", user.userId)).unique();

    if (existing) {
      await ctx.db.patch(existing._id, { name, email, avatarUrl: args.avatarUrl, updatedAt: timestamp });
      return existing._id;
    }

    return ctx.db.insert("profiles", { userId: user.userId, name, email, avatarUrl: args.avatarUrl, createdAt: timestamp, updatedAt: timestamp });
  },
});

export const setExperimentalFeaturesEnabled = mutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const timestamp = now();
    const existing = await ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", user.userId)).unique();

    if (existing) {
      await ctx.db.patch(existing._id, { experimentalFeaturesEnabled: args.enabled, updatedAt: timestamp });
      return existing._id;
    }

    const name = assertLength((user.name ?? "Todo user").trim(), 2, 80, "Name");
    const email = assertLength((user.email ?? `${user.userId}@example.com`).toLowerCase().trim(), 3, 160, "Email");
    return ctx.db.insert("profiles", {
      userId: user.userId,
      name,
      email,
      experimentalFeaturesEnabled: args.enabled,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },
});
