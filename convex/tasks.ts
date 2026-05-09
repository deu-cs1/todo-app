import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { canEditTask, requireCanViewTask, requireCurrentUser, requireTeamMember } from "./lib/authz";
import { now } from "./lib/time";
import { assertLength, assignmentStatus, priority } from "./lib/validators";
import { createNotification, getProfileName } from "./lib/notifications";

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

    const creatorName = await getProfileName(ctx, user.userId, "A teammate");
    await Promise.all(
      uniqueAssignees.map((assigneeId) =>
        createNotification(ctx, {
          userId: assigneeId,
          teamId: args.teamId,
          taskId,
          type: "task_created",
          title: "New task assigned",
          body: `${creatorName} added "${args.title}" and assigned it to you.`,
          createdAt: timestamp,
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

export const listProjectTasksDetailed = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found.");
    await requireTeamMember(ctx, project.teamId);
    const tasks = await ctx.db.query("tasks").withIndex("by_projectId", (q) => q.eq("projectId", args.projectId)).collect();
    return Promise.all(tasks.map((task) => hydrateTask(ctx, task)));
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

export const listMyTasksDetailed = query({
  args: { teamId: v.optional(v.id("teams")) },
  handler: async (ctx, args) => {
    return listMyHydratedTasks(ctx, args.teamId);
  },
});

export const listTodayTasks = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await listMyHydratedTasks(ctx);
    const start = startOfToday();
    const end = start + 24 * 60 * 60 * 1000;
    return tasks.filter((task: any) => task.dueDate && task.dueDate >= start && task.dueDate < end);
  },
});

export const listUpcomingTasks = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await listMyHydratedTasks(ctx);
    const endOfToday = startOfToday() + 24 * 60 * 60 * 1000;
    return tasks.filter((task: any) => task.dueDate && task.dueDate >= endOfToday);
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
    const timestamp = now();
    const assignment = await ctx.db
      .query("taskAssignments")
      .withIndex("by_taskId_and_userId", (q) => q.eq("taskId", args.taskId).eq("userId", user.userId))
      .unique();
    if (!assignment) throw new Error("Only an assigned user can update their own assignment status.");
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found.");
    await ctx.db.patch(assignment._id, {
      status: args.status,
      updatedAt: timestamp,
      completedAt: args.status === "completed" ? timestamp : undefined,
    });

    const statusLabel = args.status === "in_progress" ? "doing" : args.status === "completed" ? "done" : "todo";
    const actorName = await getProfileName(ctx, user.userId, "A teammate");
    const taskAssignments = await ctx.db.query("taskAssignments").withIndex("by_taskId", (q) => q.eq("taskId", args.taskId)).collect();
    const recipientIds = new Set<string>([task.createdById, ...taskAssignments.map((item) => item.userId)]);
    recipientIds.delete(user.userId);
    await Promise.all(
      [...recipientIds].map((userId) =>
        createNotification(ctx, {
          userId,
          teamId: task.teamId,
          taskId: args.taskId,
          type: "status_changed",
          title: "Task status updated",
          body: `${actorName} changed "${task.title}" to ${statusLabel}.`,
          createdAt: timestamp,
        }),
      ),
    );
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

export const deleteTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found.");
    const { membership } = await requireTeamMember(ctx, task.teamId);
    if (membership.role !== "owner") throw new Error("Only the team owner can delete tasks.");

    const assignments = await ctx.db.query("taskAssignments").withIndex("by_taskId", (q) => q.eq("taskId", args.taskId)).collect();
    await Promise.all(assignments.map((assignment) => ctx.db.delete(assignment._id)));
    await ctx.db.delete(args.taskId);
  },
});

export const setTaskAssignees = mutation({
  args: { taskId: v.id("tasks"), assigneeIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found.");
    if (!(await canEditTask(ctx, task))) throw new Error("You cannot change assignees for this task.");
    const user = await requireCurrentUser(ctx);
    const uniqueAssigneeIds = [...new Set(args.assigneeIds)];

    for (const assigneeId of uniqueAssigneeIds) {
      const membership = await ctx.db
        .query("teamMembers")
        .withIndex("by_teamId_and_userId", (q) => q.eq("teamId", task.teamId).eq("userId", assigneeId))
        .unique();
      if (!membership || membership.status !== "active") throw new Error("Every assignee must be an active team member.");
    }

    const existing = await ctx.db.query("taskAssignments").withIndex("by_taskId", (q) => q.eq("taskId", args.taskId)).collect();
    const timestamp = now();

    for (const assignment of existing) {
      if (!uniqueAssigneeIds.includes(assignment.userId)) {
        await ctx.db.delete(assignment._id);
      }
    }

    for (const assigneeId of uniqueAssigneeIds) {
      if (!existing.some((assignment) => assignment.userId === assigneeId)) {
        await ctx.db.insert("taskAssignments", {
          taskId: args.taskId,
          teamId: task.teamId,
          projectId: task.projectId,
          userId: assigneeId,
          assignedById: user.userId,
          status: "todo",
          createdAt: timestamp,
          updatedAt: timestamp,
        });
        await createNotification(ctx, {
          userId: assigneeId,
          teamId: task.teamId,
          taskId: args.taskId,
          type: "task_created",
          title: "New task assigned",
          body: `${await getProfileName(ctx, user.userId, "A teammate")} assigned "${task.title}" to you.`,
          createdAt: timestamp,
        });
      }
    }

    await ctx.db.patch(args.taskId, { updatedAt: timestamp });
  },
});

async function hydrateTask(ctx: any, task: any) {
  const [project, assignments] = await Promise.all([
    ctx.db.get(task.projectId),
    ctx.db.query("taskAssignments").withIndex("by_taskId", (q: any) => q.eq("taskId", task._id)).collect(),
  ]);
  const hydratedAssignments = await Promise.all(
    assignments.map(async (assignment: any) => {
      const profile = await ctx.db.query("profiles").withIndex("by_userId", (q: any) => q.eq("userId", assignment.userId)).unique();
      return { ...assignment, profile };
    }),
  );
  return { ...task, project, assignments: hydratedAssignments };
}

async function listMyHydratedTasks(ctx: any, teamId?: any) {
  const user = await requireCurrentUser(ctx);
  const assignments = teamId
    ? await ctx.db
        .query("taskAssignments")
        .withIndex("by_teamId_and_userId", (q: any) => q.eq("teamId", teamId).eq("userId", user.userId))
        .collect()
    : await ctx.db.query("taskAssignments").withIndex("by_userId", (q: any) => q.eq("userId", user.userId)).collect();
  const tasks = await Promise.all(assignments.map((assignment: any) => ctx.db.get(assignment.taskId)));
  return Promise.all(tasks.filter((task: any) => task !== null).map((task: any) => hydrateTask(ctx, task)));
}

function startOfToday() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}
