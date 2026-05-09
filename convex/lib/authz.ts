import { type MutationCtx, type QueryCtx } from "../_generated/server";
import { type Id } from "../_generated/dataModel";

type Ctx = QueryCtx | MutationCtx;

export async function requireCurrentUser(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required.");
  }
  const userId = identity.subject as Id<"users">;
  const authUser = await safeGetAuthUser(ctx, userId);
  const passwordAccount = await safeGetPasswordAccount(ctx, userId);
  const email = identity.email?.trim() || authUser?.email?.trim() || passwordAccount?.providerAccountId.trim() || "";
  return {
    userId: identity.subject,
    email,
    name: identity.name?.trim() || authUser?.name?.trim() || email || "Unknown user",
  };
}

async function safeGetAuthUser(ctx: Ctx, userId: Id<"users">) {
  try {
    return await ctx.db.get(userId);
  } catch {
    return null;
  }
}

async function safeGetPasswordAccount(ctx: Ctx, userId: Id<"users">) {
  try {
    return await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", userId).eq("provider", "password"))
      .first();
  } catch {
    return null;
  }
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
