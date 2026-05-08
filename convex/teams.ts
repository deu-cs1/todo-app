import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser, requireTeamAdminOrOwner, requireTeamMember } from "./lib/authz";
import { now } from "./lib/time";
import { assertLength, teamRole } from "./lib/validators";

export const createTeam = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const timestamp = now();
    const name = assertLength(args.name, 2, 60, "Team name");
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${timestamp}`;
    const teamId = await ctx.db.insert("teams", { name, slug, ownerId: user.userId, createdAt: timestamp, updatedAt: timestamp });
    await ctx.db.insert("teamMembers", { teamId, userId: user.userId, role: "owner", status: "active", joinedAt: timestamp });
    return teamId;
  },
});

export const listMyTeams = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const memberships = await ctx.db.query("teamMembers").withIndex("by_userId", (q) => q.eq("userId", user.userId)).collect();
    return Promise.all(memberships.filter((item) => item.status === "active").map((item) => ctx.db.get(item.teamId)));
  },
});

export const getTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireTeamMember(ctx, args.teamId);
    return ctx.db.get(args.teamId);
  },
});

export const changeMemberRole = mutation({
  args: { teamId: v.id("teams"), userId: v.string(), role: teamRole },
  handler: async (ctx, args) => {
    await requireTeamAdminOrOwner(ctx, args.teamId);
    if (args.role === "owner") throw new Error("Transfer ownership explicitly before assigning owner role.");
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) => q.eq("teamId", args.teamId).eq("userId", args.userId))
      .unique();
    if (!membership || membership.role === "owner") throw new Error("Cannot change this member role.");
    await ctx.db.patch(membership._id, { role: args.role });
  },
});

export const removeTeamMember = mutation({
  args: { teamId: v.id("teams"), userId: v.string() },
  handler: async (ctx, args) => {
    const { user } = await requireTeamAdminOrOwner(ctx, args.teamId);
    if (user.userId === args.userId) throw new Error("Owners/admins cannot remove themselves.");
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) => q.eq("teamId", args.teamId).eq("userId", args.userId))
      .unique();
    if (!membership || membership.role === "owner") throw new Error("Cannot remove this member.");
    await ctx.db.patch(membership._id, { status: "removed", removedAt: now() });
  },
});
