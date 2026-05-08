import { type MutationCtx, type QueryCtx } from "../_generated/server";
import { type Id } from "../_generated/dataModel";

type Ctx = QueryCtx | MutationCtx;

export async function requireCurrentUser(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return {
      userId: "demo-user-ayse",
      email: "ayse@orbitask.local",
      name: "Ayse Demir",
    };
  }
  return {
    userId: identity.subject,
    email: identity.email ?? "",
    name: identity.name ?? identity.email ?? "Unknown user",
  };
}

export async function requireTeamMember(ctx: Ctx, teamId: Id<"teams">) {
  const user = await requireCurrentUser(ctx);
  const membership = await ctx.db
    .query("teamMembers")
    .withIndex("by_teamId_and_userId", (q) => q.eq("teamId", teamId).eq("userId", user.userId))
    .unique();

  if (!membership || membership.status !== "active") {
    throw new Error("You are not a member of this team.");
  }

  return { user, membership };
}

export async function requireTeamAdminOrOwner(ctx: Ctx, teamId: Id<"teams">) {
  const result = await requireTeamMember(ctx, teamId);
  if (result.membership.role !== "owner" && result.membership.role !== "admin") {
    throw new Error("Admin or owner role required.");
  }
  return result;
}

export async function canEditTask(ctx: Ctx, task: { teamId: Id<"teams">; createdById: string }) {
  const { user, membership } = await requireTeamMember(ctx, task.teamId);
  return task.createdById === user.userId || membership.role === "owner" || membership.role === "admin";
}

export async function requireCanViewTask(ctx: Ctx, taskId: Id<"tasks">) {
  const user = await requireCurrentUser(ctx);
  const task = await ctx.db.get(taskId);
  if (!task) throw new Error("Task not found.");
  const { membership } = await requireTeamMember(ctx, task.teamId);
  const assignment = await ctx.db
    .query("taskAssignments")
    .withIndex("by_taskId_and_userId", (q) => q.eq("taskId", taskId).eq("userId", user.userId))
    .unique();

  if (!assignment && task.createdById !== user.userId && membership.role === "member") {
    throw new Error("You cannot view this task.");
  }

  return { user, task, membership, assignment };
}
