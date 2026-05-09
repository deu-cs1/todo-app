import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser, requireTeamAdminOrOwner, requireTeamMember } from "./lib/authz";
import { now, sevenDaysMs } from "./lib/time";
import { inviteRole } from "./lib/validators";
import { createNotification, getProfileName } from "./lib/notifications";

async function hashToken(token: string) {
  return token;
}

function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

async function getCurrentEmails(ctx: any, user: { userId: string; email: string }) {
  const profile = await ctx.db.query("profiles").withIndex("by_userId", (q: any) => q.eq("userId", user.userId)).unique();
  return [profile?.email, user.email]
    .map((email) => normalizeEmail(email ?? ""))
    .filter((email, index, emails) => email && emails.indexOf(email) === index);
}

async function findProfileByEmail(ctx: any, email: string) {
  const normalizedEmail = normalizeEmail(email);
  const exactProfile = await ctx.db.query("profiles").withIndex("by_email", (q: any) => q.eq("email", normalizedEmail)).unique();
  if (exactProfile) return exactProfile;

  const profiles = await ctx.db.query("profiles").collect();
  return profiles.find((profile: { email: string }) => normalizeEmail(profile.email) === normalizedEmail) ?? null;
}

async function listInvitesByEmail(ctx: any, email: string) {
  const normalizedEmail = normalizeEmail(email);
  const exactInvites = await ctx.db.query("teamInvites").withIndex("by_email", (q: any) => q.eq("email", normalizedEmail)).collect();
  const allInvites = await ctx.db.query("teamInvites").collect();
  const normalizedMatches = allInvites.filter((invite: { email: string }) => normalizeEmail(invite.email) === normalizedEmail);
  const inviteIds = new Set(exactInvites.map((invite: { _id: string }) => invite._id));

  return [...exactInvites, ...normalizedMatches.filter((invite: { _id: string }) => !inviteIds.has(invite._id))];
}

export const createTeamInvite = mutation({
  args: { teamId: v.id("teams"), email: v.string(), role: inviteRole },
  handler: async (ctx, args) => {
    const { user } = await requireTeamAdminOrOwner(ctx, args.teamId);
    const email = normalizeEmail(args.email);
    const invitedProfile = await findProfileByEmail(ctx, email);
    if (!invitedProfile) throw new Error("No account exists for this email yet.");
    const team = await ctx.db.get(args.teamId);

    const existingMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) => q.eq("teamId", args.teamId).eq("userId", invitedProfile.userId))
      .unique();
    if (existingMembership?.status === "active") throw new Error("This user is already a team member.");

    const existingInvite = await ctx.db.query("teamInvites").withIndex("by_teamId_and_email", (q) => q.eq("teamId", args.teamId).eq("email", email)).first();
    const token = crypto.randomUUID();
    const timestamp = now();
    if (existingInvite?.status === "pending") {
      await ctx.db.patch(existingInvite._id, {
        role: args.role,
        tokenHash: await hashToken(token),
        invitedById: user.userId,
        createdAt: timestamp,
        expiresAt: timestamp + sevenDaysMs,
      });
      await createNotification(ctx, {
        userId: invitedProfile.userId,
        teamId: args.teamId,
        type: "team_invite",
        title: "Team invite updated",
        body: `${await getProfileName(ctx, user.userId, "A team admin")} updated your invite to join ${team?.name ?? "a team"} as ${args.role}.`,
        createdAt: timestamp,
      });
      return { ok: true };
    }

    await ctx.db.insert("teamInvites", {
      teamId: args.teamId,
      email,
      role: args.role,
      tokenHash: await hashToken(token),
      status: "pending",
      invitedById: user.userId,
      createdAt: timestamp,
      expiresAt: timestamp + sevenDaysMs,
    });
    await createNotification(ctx, {
      userId: invitedProfile.userId,
      teamId: args.teamId,
      type: "team_invite",
      title: "New team invite",
      body: `${await getProfileName(ctx, user.userId, "A team admin")} invited you to join ${team?.name ?? "a team"} as ${args.role}.`,
      createdAt: timestamp,
    });
    return { ok: true };
  },
});

export const listTeamInvites = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireTeamMember(ctx, args.teamId);
    return ctx.db.query("teamInvites").withIndex("by_teamId", (q) => q.eq("teamId", args.teamId)).collect();
  },
});

export const listMyPendingInvites = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const emails = await getCurrentEmails(ctx, user);
    if (emails.length === 0) return [];

    const invitesByEmail = await Promise.all(emails.map((email) => listInvitesByEmail(ctx, email)));
    const inviteIds = new Set<string>();
    const invites = invitesByEmail.flat().filter((invite: { _id: string }) => {
      if (inviteIds.has(invite._id)) return false;
      inviteIds.add(invite._id);
      return true;
    });
    const timestamp = now();

    return Promise.all(
      invites
        .filter((invite) => invite.status === "pending" && invite.expiresAt >= timestamp)
        .map(async (invite) => {
          const team = await ctx.db.get(invite.teamId);
          const invitedByProfile = await ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", invite.invitedById)).unique();
          return {
            ...invite,
            team,
            invitedBy: invitedByProfile ?? {
              userId: invite.invitedById,
              name: "A team admin",
              email: "",
            },
          };
        }),
    );
  },
});

export const acceptInvite = mutation({
  args: { inviteId: v.id("teamInvites") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const emails = await getCurrentEmails(ctx, user);
    const invite = await ctx.db.get(args.inviteId);
    if (!invite || invite.status !== "pending") throw new Error("Invite is not available.");
    if (invite.expiresAt < now()) throw new Error("Invite has expired.");
    if (!emails.includes(normalizeEmail(invite.email))) throw new Error("Invite email does not match your account.");
    const timestamp = now();
    const existingMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) => q.eq("teamId", invite.teamId).eq("userId", user.userId))
      .unique();
    if (existingMembership) {
      await ctx.db.patch(existingMembership._id, { role: invite.role, status: "active", joinedAt: timestamp, removedAt: undefined });
    } else {
      await ctx.db.insert("teamMembers", { teamId: invite.teamId, userId: user.userId, role: invite.role, status: "active", joinedAt: timestamp });
    }
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
