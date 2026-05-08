import { mutation } from "./_generated/server";
import { requireCurrentUser } from "./lib/authz";
import { now } from "./lib/time";

const demoMembers = [
  { userId: "demo-user-ayse", name: "Ayse Demir", email: "ayse@orbitask.local", role: "owner" as const },
  { userId: "demo-user-mehmet", name: "Mehmet Kaya", email: "mehmet@orbitask.local", role: "admin" as const },
  { userId: "demo-user-zeynep", name: "Zeynep Arslan", email: "zeynep@orbitask.local", role: "member" as const },
  { userId: "demo-user-can", name: "Can Yilmaz", email: "can@orbitask.local", role: "member" as const },
];

export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    const currentUser = await requireCurrentUser(ctx);
    const existingMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_userId", (q) => q.eq("userId", currentUser.userId))
      .first();
    if (existingMembership) return existingMembership.teamId;

    const timestamp = now();
    const teamId = await ctx.db.insert("teams", {
      name: "Launch Team",
      slug: `launch-team-${timestamp}`,
      ownerId: currentUser.userId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    for (const member of demoMembers) {
      await ctx.db.insert("profiles", {
        userId: member.userId,
        name: member.name,
        email: member.email,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      await ctx.db.insert("teamMembers", {
        teamId,
        userId: member.userId,
        role: member.role,
        status: "active",
        joinedAt: timestamp,
      });
    }

    const websiteProjectId = await ctx.db.insert("projects", {
      teamId,
      name: "Website Launch",
      description: "Launch funnel, responsive UI, and QA pass.",
      color: "#dc2626",
      createdById: currentUser.userId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    const betaProjectId = await ctx.db.insert("projects", {
      teamId,
      name: "Beta Feedback",
      description: "Invite flows and early customer feedback.",
      color: "#0f766e",
      createdById: currentUser.userId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    const growthProjectId = await ctx.db.insert("projects", {
      teamId,
      name: "Growth Sprint",
      description: "Activation experiments and onboarding.",
      color: "#7c3aed",
      createdById: currentUser.userId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    await createDemoTask(ctx, {
      teamId,
      projectId: websiteProjectId,
      title: "Prepare launch landing page",
      description: "Finalize sections, conversion copy, and responsive polish before QA.",
      dueDate: startOfToday(),
      priority: "urgent",
      assignees: [
        ["demo-user-ayse", "completed"],
        ["demo-user-mehmet", "in_progress"],
        ["demo-user-zeynep", "todo"],
      ],
    });
    await createDemoTask(ctx, {
      teamId,
      projectId: betaProjectId,
      title: "Review invite acceptance edge cases",
      description: "Check expired, revoked, and mismatched-email invite flows.",
      dueDate: startOfToday() + 24 * 60 * 60 * 1000,
      priority: "high",
      assignees: [
        ["demo-user-ayse", "in_progress"],
        ["demo-user-mehmet", "todo"],
      ],
    });
    await createDemoTask(ctx, {
      teamId,
      projectId: growthProjectId,
      title: "Draft team member onboarding checklist",
      description: "Create a short workflow that shows multi-assignee responsibility clearly.",
      dueDate: startOfToday() + 5 * 24 * 60 * 60 * 1000,
      priority: "medium",
      assignees: [
        ["demo-user-ayse", "todo"],
        ["demo-user-can", "todo"],
      ],
    });

    return teamId;
  },
});

export const clearAllData = mutation({
  args: {},
  handler: async (ctx) => {
    const tableNames = ["taskAssignments", "tasks", "sections", "projects", "teamInvites", "teamMembers", "teams", "profiles"] as const;

    for (const tableName of tableNames) {
      const documents = await ctx.db.query(tableName).collect();
      for (const document of documents) {
        await ctx.db.delete(document._id);
      }
    }
  },
});

async function createDemoTask(
  ctx: Parameters<typeof mutation>[0] extends never ? never : any,
  args: {
    teamId: any;
    projectId: any;
    title: string;
    description: string;
    dueDate: number;
    priority: "low" | "medium" | "high" | "urgent";
    assignees: Array<[string, "todo" | "in_progress" | "completed"]>;
  },
) {
  const timestamp = now();
  const taskId = await ctx.db.insert("tasks", {
    teamId: args.teamId,
    projectId: args.projectId,
    title: args.title,
    description: args.description,
    dueDate: args.dueDate,
    priority: args.priority,
    createdById: "demo-user-ayse",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  for (const [userId, status] of args.assignees) {
    await ctx.db.insert("taskAssignments", {
      taskId,
      teamId: args.teamId,
      projectId: args.projectId,
      userId,
      assignedById: "demo-user-ayse",
      status,
      createdAt: timestamp,
      updatedAt: timestamp,
      completedAt: status === "completed" ? timestamp : undefined,
    });
  }
}

function startOfToday() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}
