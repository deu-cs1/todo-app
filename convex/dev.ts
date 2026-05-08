import { mutation } from "./_generated/server";

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
