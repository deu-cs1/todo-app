export async function createNotification(
  ctx: any,
  args: {
    userId: string;
    teamId?: any;
    taskId?: any;
    type: "task_created" | "team_invite" | "status_changed";
    title: string;
    body: string;
    createdAt: number;
  },
) {
  await ctx.db.insert("notifications", args);
}

export async function getProfileName(ctx: any, userId: string, fallback = "A teammate") {
  const profile = await ctx.db.query("profiles").withIndex("by_userId", (q: any) => q.eq("userId", userId)).unique();
  return profile?.name ?? fallback;
}
