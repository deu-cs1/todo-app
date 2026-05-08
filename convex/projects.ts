import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser, requireTeamAdminOrOwner, requireTeamMember } from "./lib/authz";
import { now } from "./lib/time";
import { assertLength } from "./lib/validators";

export const createProject = mutation({
  args: { teamId: v.id("teams"), name: v.string(), description: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { user } = await requireTeamAdminOrOwner(ctx, args.teamId);
    const timestamp = now();
    return ctx.db.insert("projects", {
      teamId: args.teamId,
      name: assertLength(args.name, 1, 80, "Project name"),
      description: args.description?.slice(0, 500),
      createdById: user.userId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },
});

export const listTeamProjects = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireTeamMember(ctx, args.teamId);
    return ctx.db.query("projects").withIndex("by_teamId", (q) => q.eq("teamId", args.teamId)).collect();
  },
});

export const archiveProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found.");
    await requireTeamAdminOrOwner(ctx, project.teamId);
    await ctx.db.patch(args.projectId, { archivedAt: now(), updatedAt: now() });
  },
});

export const updateProject = mutation({
  args: { projectId: v.id("projects"), name: v.optional(v.string()), description: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found.");
    await requireTeamAdminOrOwner(ctx, project.teamId);
    await ctx.db.patch(args.projectId, {
      name: args.name ? assertLength(args.name, 1, 80, "Project name") : project.name,
      description: args.description?.slice(0, 500),
      updatedAt: now(),
    });
  },
});
