import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser } from "./lib/authz";
import { now } from "./lib/time";

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const notifications = await ctx.db.query("notifications").withIndex("by_userId", (q) => q.eq("userId", user.userId)).collect();
    return notifications.sort((a, b) => b.createdAt - a.createdAt).slice(0, 20);
  },
});

export const setRead = mutation({
  args: { notificationId: v.id("notifications"), read: v.boolean() },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== user.userId) throw new Error("Notification not found.");
    await ctx.db.patch(args.notificationId, { readAt: args.read ? now() : undefined });
  },
});
