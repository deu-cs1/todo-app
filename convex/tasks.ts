import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { canEditTask, requireCanViewTask, requireCurrentUser, requireTeamMember } from "./lib/authz";
import { now } from "./lib/time";
import { assertLength, assignmentStatus, priority } from "./lib/validators";

export const createTask = mutation({
  args: {
    teamId: v.id("teams"),
    projectId: v.id("projects"),
    sectionId: v.optional(v.id("sections")),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    priority,
    assigneeIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireTeamMember(ctx, args.teamId);
    const project = await ctx.db.get(args.projectId);
    if (!project || project.teamId !== args.teamId) throw new Error("Invalid project.");
    const uniqueAssignees = [...new Set(args.assigneeIds)];

    for (const assigneeId of uniqueAssignees) {
      const membership = await ctx.db
        .query("teamMembers")
        .withIndex("by_teamId_and_userId", (q) => q.eq("teamId", args.teamId).eq("userId", assigneeId))
        .unique();
      if (!membership || membership.status !== "active") throw new Error("Every assignee must be an active team member.");
    }

    const timestamp = now();
    const taskId = await ctx.db.insert("tasks", {
      teamId: args.teamId,
      projectId: args.projectId,
      sectionId: args.sectionId,
      title: assertLength(args.title, 1, 200, "Task title"),
      description: args.description?.slice(0, 5000),
      dueDate: args.dueDate,
      priority: args.priority,
      createdById: user.userId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    await Promise.all(
      uniqueAssignees.map((assigneeId) =>
        ctx.db.insert("taskAssignments", {
          taskId,
          teamId: args.teamId,
          projectId: args.projectId,
          userId: assigneeId,
          assignedById: user.userId,
          status: "todo",
          createdAt: timestamp,
          updatedAt: timestamp,
        }),
      ),
    );

    return taskId;
  },
});

export const listProjectTasks = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found.");
    await requireTeamMember(ctx, project.teamId);
    return ctx.db.query("tasks").withIndex("by_projectId", (q) => q.eq("projectId", args.projectId)).collect();
  },
});

export const listMyTasks = query({
  args: { teamId: v.optional(v.id("teams")) },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const assignments = args.teamId
      ? await ctx.db
          .query("taskAssignments")
          .withIndex("by_teamId_and_userId", (q) => q.eq("teamId", args.teamId!).eq("userId", user.userId))
          .collect()
      : await ctx.db.query("taskAssignments").withIndex("by_userId", (q) => q.eq("userId", user.userId)).collect();
    return Promise.all(assignments.map((assignment) => ctx.db.get(assignment.taskId)));
  },
});

export const getTaskWithAssignments = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const { task } = await requireCanViewTask(ctx, args.taskId);
    const assignments = await ctx.db.query("taskAssignments").withIndex("by_taskId", (q) => q.eq("taskId", args.taskId)).collect();
    return { task, assignments };
  },
});

export const updateMyAssignmentStatus = mutation({
  args: { taskId: v.id("tasks"), status: assignmentStatus },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const assignment = await ctx.db
      .query("taskAssignments")
      .withIndex("by_taskId_and_userId", (q) => q.eq("taskId", args.taskId).eq("userId", user.userId))
      .unique();
    if (!assignment) throw new Error("Only an assigned user can update their own assignment status.");
    await ctx.db.patch(assignment._id, {
      status: args.status,
      updatedAt: now(),
      completedAt: args.status === "completed" ? now() : undefined,
    });
  },
});

export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    priority: v.optional(priority),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found.");
    if (!(await canEditTask(ctx, task))) throw new Error("You cannot edit this task.");
    await ctx.db.patch(args.taskId, {
      title: args.title ? assertLength(args.title, 1, 200, "Task title") : task.title,
      description: args.description?.slice(0, 5000),
      dueDate: args.dueDate,
      priority: args.priority ?? task.priority,
      updatedAt: now(),
    });
  },
});

export const archiveTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found.");
    if (!(await canEditTask(ctx, task))) throw new Error("You cannot archive this task.");
    await ctx.db.patch(args.taskId, { archivedAt: now(), updatedAt: now() });
  },
});
