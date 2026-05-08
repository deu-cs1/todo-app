import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser, requireTeamAdminOrOwner, requireTeamMember } from "./lib/authz";
import { now } from "./lib/time";
import { assertLength, teamRole } from "./lib/validators";

function slugify(value: string, timestamp: number) {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${slug || "workspace"}-${timestamp}`;
}

async function createDefaultProject(ctx: any, teamId: any, userId: string, name: string) {
  const timestamp = now();
  const existingProject = await ctx.db.query("projects").withIndex("by_teamId", (q: any) => q.eq("teamId", teamId)).first();
  if (existingProject) return existingProject._id;

  return ctx.db.insert("projects", {
    teamId,
    name,
    description: name === "Personal" ? "Your private task list." : "Shared team tasks.",
    color: name === "Personal" ? "#2563eb" : "#dc2626",
    createdById: userId,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

async function getTeamByMembership(ctx: any, membership: { teamId: any }) {
  try {
    return await ctx.db.get(membership.teamId);
  } catch {
    return null;
  }
}

export const createTeam = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const timestamp = now();
    const name = assertLength(args.name, 2, 60, "Team name");
    const teamId = await ctx.db.insert("teams", { name, slug: slugify(name, timestamp), kind: "team", ownerId: user.userId, createdAt: timestamp, updatedAt: timestamp });
    await ctx.db.insert("teamMembers", { teamId, userId: user.userId, role: "owner", status: "active", joinedAt: timestamp });
    await createDefaultProject(ctx, teamId, user.userId, "Team");
    return teamId;
  },
});

export const ensurePersonalWorkspace = mutation({
  args: { name: v.optional(v.string()), email: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const timestamp = now();
    const name = assertLength((args.name ?? user.name).trim(), 2, 80, "Name");
    const email = assertLength((args.email ?? user.email).toLowerCase().trim(), 3, 160, "Email");

    const existingProfile = await ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", user.userId)).unique();
    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, { name, email, updatedAt: timestamp });
    } else {
      await ctx.db.insert("profiles", { userId: user.userId, name, email, createdAt: timestamp, updatedAt: timestamp });
    }

    const memberships = await ctx.db.query("teamMembers").withIndex("by_userId", (q) => q.eq("userId", user.userId)).collect();
    for (const membership of memberships) {
      if (membership.status !== "active") continue;
      const team = await getTeamByMembership(ctx, membership);
      if (team?.kind === "personal") {
        await createDefaultProject(ctx, team._id, user.userId, "Personal");
        return team._id;
      }
    }

    const workspaceName = `${name.split(" ")[0]}'s Personal Workspace`;
    const teamId = await ctx.db.insert("teams", { name: workspaceName, slug: slugify(`personal-${user.userId}`, timestamp), kind: "personal", ownerId: user.userId, createdAt: timestamp, updatedAt: timestamp });
    await ctx.db.insert("teamMembers", { teamId, userId: user.userId, role: "owner", status: "active", joinedAt: timestamp });
    await createDefaultProject(ctx, teamId, user.userId, "Personal");
    return teamId;
  },
});

export const listMyTeams = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const memberships = await ctx.db.query("teamMembers").withIndex("by_userId", (q) => q.eq("userId", user.userId)).collect();
    const teams = await Promise.all(memberships.filter((item) => item.status === "active").map((item) => getTeamByMembership(ctx, item)));
    return teams.filter((team) => team && team.kind !== "personal");
  },
});

export const getMyWorkspace = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const memberships = await ctx.db.query("teamMembers").withIndex("by_userId", (q) => q.eq("userId", user.userId)).collect();
    const activeMemberships = memberships.filter((item) => item.status === "active");
    const teamEntries = (
      await Promise.all(
        activeMemberships.map(async (membership) => ({
          membership,
          team: await getTeamByMembership(ctx, membership),
        })),
      )
    ).filter((entry) => entry.team);
    const personalEntry = teamEntries.find((entry) => entry.team?.kind === "personal");
    const activeMembership = personalEntry?.membership ?? teamEntries[0]?.membership;
    const team = personalEntry?.team ?? teamEntries[0]?.team;
    if (!activeMembership || !team) return null;
    const projects = await ctx.db.query("projects").withIndex("by_teamId", (q) => q.eq("teamId", team._id)).collect();
    const members = await ctx.db.query("teamMembers").withIndex("by_teamId_and_status", (q) => q.eq("teamId", team._id).eq("status", "active")).collect();
    return { user, team, projects, members };
  },
});

export const getWorkspaceByTeamId = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const { user } = await requireTeamMember(ctx, args.teamId);
    const team = await ctx.db.get(args.teamId);
    if (!team) return null;
    const projects = await ctx.db.query("projects").withIndex("by_teamId", (q) => q.eq("teamId", team._id)).collect();
    const members = await ctx.db.query("teamMembers").withIndex("by_teamId_and_status", (q) => q.eq("teamId", team._id).eq("status", "active")).collect();
    return { user, team, projects, members };
  },
});

export const getTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireTeamMember(ctx, args.teamId);
    return ctx.db.get(args.teamId);
  },
});

export const listTeamMembers = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireTeamMember(ctx, args.teamId);
    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_status", (q) => q.eq("teamId", args.teamId).eq("status", "active"))
      .collect();

    return Promise.all(
      memberships.map(async (membership) => {
        const profile = await ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", membership.userId)).unique();
        return { ...membership, profile };
      }),
    );
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
