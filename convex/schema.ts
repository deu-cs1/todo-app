import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  profiles: defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),

  teams: defineTable({
    name: v.string(),
    slug: v.string(),
    kind: v.optional(v.union(v.literal("personal"), v.literal("team"))),
    ownerId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    archivedAt: v.optional(v.number()),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_slug", ["slug"]),

  teamMembers: defineTable({
    teamId: v.id("teams"),
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    status: v.union(v.literal("active"), v.literal("removed")),
    joinedAt: v.number(),
    removedAt: v.optional(v.number()),
  })
    .index("by_teamId", ["teamId"])
    .index("by_userId", ["userId"])
    .index("by_teamId_and_userId", ["teamId", "userId"])
    .index("by_teamId_and_status", ["teamId", "status"]),

  teamInvites: defineTable({
    teamId: v.id("teams"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
    tokenHash: v.string(),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("revoked"), v.literal("expired")),
    invitedById: v.string(),
    acceptedById: v.optional(v.string()),
    createdAt: v.number(),
    expiresAt: v.number(),
    acceptedAt: v.optional(v.number()),
  })
    .index("by_teamId", ["teamId"])
    .index("by_email", ["email"])
    .index("by_tokenHash", ["tokenHash"])
    .index("by_teamId_and_email", ["teamId", "email"]),

  projects: defineTable({
    teamId: v.id("teams"),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    createdById: v.string(),
    archivedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_teamId", ["teamId"])
    .index("by_teamId_and_archivedAt", ["teamId", "archivedAt"]),

  sections: defineTable({
    teamId: v.id("teams"),
    projectId: v.id("projects"),
    name: v.string(),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_projectId_and_order", ["projectId", "order"]),

  tasks: defineTable({
    teamId: v.id("teams"),
    projectId: v.id("projects"),
    sectionId: v.optional(v.id("sections")),
    title: v.string(),
    description: v.optional(v.string()),
    createdById: v.string(),
    dueDate: v.optional(v.number()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    archivedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_teamId", ["teamId"])
    .index("by_projectId", ["projectId"])
    .index("by_createdById", ["createdById"])
    .index("by_dueDate", ["dueDate"])
    .index("by_projectId_and_archivedAt", ["projectId", "archivedAt"]),

  taskAssignments: defineTable({
    taskId: v.id("tasks"),
    teamId: v.id("teams"),
    projectId: v.id("projects"),
    userId: v.string(),
    assignedById: v.string(),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("completed")),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_taskId", ["taskId"])
    .index("by_userId", ["userId"])
    .index("by_teamId_and_userId", ["teamId", "userId"])
    .index("by_projectId_and_userId", ["projectId", "userId"])
    .index("by_taskId_and_userId", ["taskId", "userId"])
    .index("by_status", ["status"]),
});
