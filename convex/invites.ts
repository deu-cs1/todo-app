import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser, requireTeamAdminOrOwner, requireTeamMember } from "./lib/authz";
import { now, sevenDaysMs } from "./lib/time";
import { inviteRole } from "./lib/validators";

async function hashToken(token: string) {
  return token;
}

export const createTeamInvite = mutation({
  args: { teamId: v.id("teams"), email: v.string(), role: inviteRole },
  handler: async (ctx, args) => {
    const { user } = await requireTeamAdminOrOwner(ctx, args.teamId);
    const token = crypto.randomUUID();
    const timestamp = now();
    await ctx.db.insert("teamInvites", {
      teamId: args.teamId,
      email: args.email.toLowerCase(),
      role: args.role,
      tokenHash: await hashToken(token),
      status: "pending",
      invitedById: user.userId,
      createdAt: timestamp,
      expiresAt: timestamp + sevenDaysMs,
    });
    return { token };
  },
});

export const listTeamInvites = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireTeamMember(ctx, args.teamId);
    return ctx.db.query("teamInvites").withIndex("by_teamId", (q) => q.eq("teamId", args.teamId)).collect();
  },
});

export const acceptInvite = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const tokenHash = await hashToken(args.token);
    const invite = await ctx.db.query("teamInvites").withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash)).unique();
    if (!invite || invite.status !== "pending") throw new Error("Invite is not available.");
    if (invite.expiresAt < now()) throw new Error("Invite has expired.");
    if (invite.email !== user.email.toLowerCase()) throw new Error("Invite email does not match your account.");
    const timestamp = now();
    await ctx.db.insert("teamMembers", { teamId: invite.teamId, userId: user.userId, role: invite.role, status: "active", joinedAt: timestamp });
    await ctx.db.patch(invite._id, { status: "accepted", acceptedById: user.userId, acceptedAt: timestamp });
  },
});

export const revokeInvite = mutation({
  args: { inviteId: v.id("teamInvites") },
  handler: async (ctx, args) => {
    const invite = await ctx.db.get(args.inviteId);
    if (!invite) throw new Error("Invite not found.");
    await requireTeamAdminOrOwner(ctx, invite.teamId);
    await ctx.db.patch(args.inviteId, { status: "revoked" });
  },
});
